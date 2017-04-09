const _ = require('lodash');
const Group = require('./groupModel');
const controller = require('./groupController');

const ACTION_TYPES = Group.getActionTypes();

try {
  eval("const {" +
    "USER_JOINED, " +
    "REQUESTED_TURN, " +
    "STOPPED_TURN_REQUEST, " +
    "TURN_GRANTED, " +
    "ENDED_TURN, " +
    "TURN_EXPIRED, " +
    "LEFT_GROUP, " +
    "DISCUSSION_EXPIRED, " +
  "} = ACTION_TYPES;");
} catch (problem) {  // the above only works in ES>=6
  console.log(problem);
}
if (typeof(USER_JOINED) == "undefined") {
  (function() {
    // make this work with either NodeJS or client-side JS
    // don't worry about using "const" at this point, we want it to work
    // on older versions of NodeJS, as on Debian Stable
    try {global.window = global;} catch (problem) {console.log(problem);}
    for (var key in ACTION_TYPES) {
      window[key] = ACTION_TYPES[key];
    }
  }());
}

const userActionListener = (client, room, groupId) => {
  client.on('action', ({ actionType, name }) => {
    const roomEmitList = [];

    if (ACTION_TYPES[actionType]) {
      controller.logAction(groupId, actionType, name)
        .then((group) => {
          switch (actionType) {
            case REQUESTED_TURN: {
              if (group.userQueue.length < 1 && group.currentSpeaker === '') {
                group.actions.push({ name, actionType: TURN_GRANTED, timeStamp: new Date() });
                roomEmitList.push({ actionType: TURN_GRANTED, name });
                group.currentSpeaker = name;
              } else {
                group.userQueue.push(name);
                const user = _.find(group.users, { name });
                user.isRequestingTurn = true;
              }
              break;
            }
            case STOPPED_TURN_REQUEST: {
              group.userQueue = group.userQueue.filter(userName => userName !== name);
              const user = _.find(group.users, { name });
              user.isRequestingTurn = false;
              break;
            }
            case ENDED_TURN: {
              roomEmitList.push({ actionType: ENDED_TURN, name });
              const prevSpeaker = _.find(group.users, { name });
              const prevSpeakerUpdatedTime = group.getSpeakerTime(name);
              prevSpeaker.timeConsumed = prevSpeakerUpdatedTime;
              prevSpeaker.isRequestingTurn = false;
              let nextSpeaker = '';
              if (group.userQueue.length > 0) {
                nextSpeaker = group.getNextSpeaker();
                console.log(`The next speaker is: ${nextSpeaker}`);
                group.userQueue = group.userQueue.filter(userName => userName !== nextSpeaker);
                group.actions.push({
                  name: nextSpeaker,
                  actionType: TURN_GRANTED,
                  timeStamp: new Date(),
                });
                roomEmitList.push({ actionType: TURN_GRANTED, name: nextSpeaker });
              }
              group.currentSpeaker = nextSpeaker;
              break;
            }
            case TURN_EXPIRED: {
              roomEmitList.push({ actionType: TURN_EXPIRED, name });
              const prevSpeaker = _.find(group.users, { name });
              const prevSpeakerUpdatedTime = group.getSpeakerTime(name);
              prevSpeaker.timeConsumed = prevSpeakerUpdatedTime;
              prevSpeaker.isRequestingTurn = false;
              let nextSpeaker = '';
              if (group.userQueue.length > 0) {
                nextSpeaker = group.getNextSpeaker();
                console.log(`The next speaker is: ${nextSpeaker}`);
                group.userQueue = group.userQueue.filter(userName => userName !== nextSpeaker);
                group.actions.push({
                  name: nextSpeaker,
                  actionType: TURN_GRANTED,
                  timeStamp: new Date(),
                });
                roomEmitList.push({ actionType: TURN_GRANTED, name: nextSpeaker });
              }
              group.currentSpeaker = nextSpeaker;
              break;
            }
            case LEFT_GROUP: {
              roomEmitList.push({ actionType: LEFT_GROUP, name });
              break;
            }
            case DISCUSSION_EXPIRED: {
              roomEmitList.push({ actionType: DISCUSSION_EXPIRED, name });
              group.isDiscussionExpired = true;
              break;
            }
            default: {
              console.log('Invalid action');
            }
          }
          return group.save();
        })
        .then(() => {
          roomEmitList.forEach((action) => {
            room.to(groupId).emit('action', action);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

const groupJoinListener = (client, namespace) => {
  client.on('join', ({ groupId, name }) => {
    controller.checkUserInGroup(groupId, name)
      .then((userInGroup) => {
        if (userInGroup) {
          return controller.logAction(groupId, USER_JOINED, name);
        }
        throw new Error('User does not belong to the group.');
      })
      .then(() => {
        client.join(groupId);
        client.to(groupId).emit('action', { actionType: USER_JOINED, name });
        userActionListener(client, namespace, groupId);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const groupSocketsHandler = (socket, namespace) => {
  namespace.on('connection', (client) => {
    client.once('disconnect', () => {
      console.log('Client disconnected');
    });

    console.log('Client connected');

    groupJoinListener(client, namespace);
  });
};

module.exports = groupSocketsHandler;
