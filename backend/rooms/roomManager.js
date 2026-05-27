const rooms = {};

function createRoom(
  roomId,
  hostId,
  hostName,
  isPrivate = false
) {

  rooms[roomId] = {

    // ROOM INFO

    turnChanging: false,
    
    roomId,

    isPrivate,

    roomCode: roomId,

    createdAt: Date.now(),

    // HOST
    hostId,

    hostName,

    // GAME STATE
    gameStarted: false,

    gameEnded: false,

    gamePaused: false,

    // PLAYERS
    players: [],

    maxPlayers: 8,

    minPlayers: 2,

    // ROUND SYSTEM
    currentRound: 1,

    maxRounds:5,

    // TURN SYSTEM
    drawerIndex: -1,

    currentDrawer: null,

    drawerId: null,

    // WORD SYSTEM
    currentWord: "",

    guessedPlayers: [],

    // TIMER
    timer: 60,

    drawTime: 60,

    interval: null,

    // CANVAS
    canvasData: [],

    // CHAT
    messages: [],
    
    wordChoices: [],

    drawnPlayers: [],
    
    // SETTINGS
    settings: {

      language: "english",

      difficulty: "easy",

      allowHints: true,

      customWords: [],

      privateRoom: isPrivate

    },

    // GAME RESULTS
    winner: null,

    leaderboard: []

  };

  return rooms[roomId];

}

// GET ROOM
function getRoom(roomId) {

  return rooms[roomId];

}

// DELETE ROOM
function deleteRoom(roomId) {

  const room = rooms[roomId];

  if (!room) return;

  clearInterval(room.interval);

  delete rooms[roomId];

}

// REMOVE PLAYER
function removePlayer(roomId, socketId) {

  const room = rooms[roomId];

  if (!room) return;

  room.players =
    room.players.filter(
      player => player.id !== socketId
    );

  // CHANGE HOST IF HOST LEFT
  if (room.hostId === socketId) {

    if (room.players.length > 0) {

      room.hostId =
        room.players[0].id;

      room.hostName =
        room.players[0].name;

    }

  }

  // DELETE ROOM IF EMPTY
  if (room.players.length === 0) {

    deleteRoom(roomId);

  }

}

module.exports = {

  rooms,

  createRoom,

  getRoom,

  deleteRoom,

  removePlayer

};