const socketio = require('socket.io');
const groupSocketsHandler = require('./group/groupSockets');

const appSocketsHandler = (server) => {
  const io = socketio.listen(server);

  const groups = io.of('/groups');
  groupSocketsHandler(io, groups);

  return io;
};

module.exports.listen = appSocketsHandler;
