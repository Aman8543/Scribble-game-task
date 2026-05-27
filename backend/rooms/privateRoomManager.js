const generateRoomCode =
require("../utils/generateRoomCode");

const {
  createRoom,
  getRoom
} = require("./roomManager");

// CREATE PRIVATE ROOM
function createPrivateRoom(
  socketId,
  playerName,
  settings
) {

  const roomCode =
    generateRoomCode();

  const room = createRoom(
    roomCode,
    socketId,
    playerName,
    true
  );

  room.maxRounds =
  settings.maxRounds;

room.maxPlayers =
  settings.maxPlayers;

room.drawTime =
  settings.drawTime;

room.settings.difficulty =
  settings.difficulty;

room.settings.customWords =
  settings.customWords
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);


    console.log({

  rounds: room.maxRounds,

  players: room.maxPlayers,

  timer: room.drawTime,

  difficulty:
    room.settings.difficulty,

  customWords:
    room.settings.customWords

});

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