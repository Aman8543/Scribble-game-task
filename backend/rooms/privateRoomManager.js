const generateRoomCode =
require("../utils/generateRoomCode");

const {
  createRoom,
  getRoom
} = require("./roomManager");

// CREATE PRIVATE ROOM
function createPrivateRoom(
  socketId,
  playerName
) {

  const roomCode =
    generateRoomCode();

  const room = createRoom(
    roomCode,
    socketId,
    playerName,
    true
  );

  // ADD HOST
  room.players.push({

    id: socketId,

    name: playerName,

    score: 0,

    guessed: false,

    isHost: true

  });

  return room;

}

// JOIN PRIVATE ROOM
function joinPrivateRoom(
  roomCode,
  socketId,
  playerName
) {

  const room =
    getRoom(roomCode);

  // ROOM NOT FOUND
  if (!room) {

    return {
      error: "Room not found"
    };

  }

  // ROOM FULL
  if (
    room.players.length >=
    room.maxPlayers
  ) {

    return {
      error: "Room is full"
    };

  }

  // GAME ALREADY STARTED
  if (room.gameStarted) {

    return {
      error:
        "Game already started"
    };

  }

  // ADD PLAYER
  room.players.push({

    id: socketId,

    name: playerName,

    score: 0,

    guessed: false,

    isHost: false

  });

  return { room };

}

module.exports = {

  createPrivateRoom,

  joinPrivateRoom

};