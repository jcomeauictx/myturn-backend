const _ = require('lodash');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const ACTION_TYPES = {
  USER_JOINED: 'USER_JOINED',
  REQUESTED_TURN: 'REQUESTED_TURN',
  STOPPED_TURN_REQUEST: 'STOPPED_TURN_REQUEST',
  TURN_GRANTED: 'TURN_GRANTED',
  ENDED_TURN: 'ENDED_TURN',
  TURN_EXPIRED: 'TURN_EXPIRED',
  LEFT_GROUP: 'LEFT_GROUP',
  DISCUSSION_EXPIRED: 'DISCUSSION_EXPIRED',
};

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  discussionLength: {
    type: Number,
    required: true,
  },
  turnMaxLength: {
    type: Number,
    required: true,
  },
  currentSpeaker: {
    type: String,
    default: '',
  },
  startTimestamp: {
    type: Date,
  },
  endTimestamp: {
    type: Date,
  },
  isDiscussionExpired: {
    type: Boolean,
    default: false,
  },
  users: [
    {
      name: {
        type: String,
        required: true,
      },
      timeConsumed: {
        type: Number,
        required: true,
        default: 0,
      },
      isRequestingTurn: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  ],
  userQueue: [
    {
      type: String,
      required: true,
    },
  ],
  actions: [
    {
      name: {
        type: String,
        required: true,
      },
      actionType: {
        type: String,
        required: true,
      },
      timeStamp: {
        type: Date,
        required: true,
      },
    },
  ],
});

GroupSchema.statics.getActionTypes = function getActionType() {
  return ACTION_TYPES;
};

GroupSchema.methods.checkUser = function checkUser(name) {
  const user = _.find(this.users, { name });
  if (user) {
    return true;
  }
  return false;
};

GroupSchema.methods.getSpeakerTime = function getSpeakerTime(userName) {
  const grantTimestamps = this.actions.filter(
    ({ name, actionType }) => actionType === ACTION_TYPES.TURN_GRANTED && userName === name);

  const latestGrantTimeStamp = _.maxBy(grantTimestamps, 'timeStamp').timeStamp;

  return new Date() - latestGrantTimeStamp;
};

GroupSchema.methods.getNextSpeaker = function getNextSpeaker() {
  const usersRequestingTurn = this.users.filter(
    ({ isRequestingTurn }) => isRequestingTurn === true);

  const nextSpeaker = _.minBy(usersRequestingTurn, 'timeConsumed').name;
  return nextSpeaker;
};

module.exports = mongoose.model('groups', GroupSchema);
