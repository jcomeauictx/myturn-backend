const _ = require('lodash');
const moment = require('moment');
const Group = require('./groupModel');

exports.get = (req, res, next) => {
  Group.find({ isDiscussionExpired: false })
    .then((groups) => {
      res.json(groups);
    })
    .catch((err) => {
      next(err);
    });
};

exports.post = (req, res, next) => {
  const newGroup = req.body;

  Group.create(newGroup)
    .then((group) => {
      res.json(group);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getOneById = (req, res, next) => {
  Group.findById(req.params.id).exec()
    .then((group) => {
      res.json(group);
    })
    .catch((err) => {
      next(err);
    });
};

exports.joinGroup = (req, res, next) => {
  Group.findById(req.params.id).exec()
    .then((group) => {
      const { name } = req.body;
      const user = _.find(group.users, { name });
      if (user) {
        const err = new Error('Name already taken, please use a different name.');
        next(err);
      } else {
        if (group.users.length === 0) {
          const now = new Date();
          group.startTimestamp = now;
          group.endTimestamp = moment(now).add(group.discussionLength, 'ms').toDate();
        }
        group.users.push({
          name,
          timeConsumed: 0,
          isRequestingTurn: false,
        });
        group.save((err, saved) => {
          if (err) {
            next(err);
          } else {
            res.json(saved);
          }
        });
      }
    })
    .catch((err) => {
      res.json(err);
    });
};

exports.checkUserInGroup = (groupId, name) =>
  Group.findById(groupId).exec()
    .then(group => group.checkUser(name));

exports.logAction = (groupId, actionType, name = '') =>
  Group.findById(groupId).exec()
    .then((group) => {
      group.actions.push({ name, actionType, timeStamp: new Date() });
      return group.save();
    });

exports.setNewSpeaker = (groupId, name) => {
  Group.findById(groupId).exec()
    .then((group) => {
      group.currentSpeaker = name;
      return group.save();
    });
};
