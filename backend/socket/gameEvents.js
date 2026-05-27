const {
  findPublicRoom
} = require(
  "../rooms/publicRoomManager"
);

const {
  createPrivateRoom,
  joinPrivateRoom
} = require(
  "../rooms/privateRoomManager"
);

const {
  getRoom,
  removePlayer
} = require(
  "../rooms/roomManager"
);

const {
  startGame,
  selectWord,
  playerGuessed
} = require(
  "../game/gameLoop"
);

function gameEvents(io, socket) {

  // =========================
  // JOIN PUBLIC ROOM
  // =========================
  socket.on(
    "joinPublicRoom",
    (playerName) => {

      const room =
        findPublicRoom(
          socket.id,
          playerName
        );

      socket.join(room.roomId);

      // SEND ROOM
      socket.emit(
  "roomJoined",
  room.roomId
);

// SEND FULL ROOM STATE
socket.emit(
  "roomState",
  {
    players: room.players,

    currentDrawer:
      room.players[
        room.drawerIndex
      ] || null,

    timer: room.timer,

    currentRound:
      room.currentRound,

    maxRounds:
      room.maxRounds,

    gameStarted:
      room.gameStarted
  }
);

// UPDATE EVERYONE
io.to(room.roomId).emit(
  "players",
  room.players
);

      // AUTO START
      if (
        room.players.length >= 2 &&
        !room.gameStarted
      ) {

        startGame(io, room);

      }

    }
  );

  // =========================
  // CREATE PRIVATE ROOM
  // =========================
  socket.on(
    "createPrivateRoom",
    (playerName) => {

      const room =
        createPrivateRoom(
          socket.id,
          playerName
        );

      socket.join(room.roomId);

      // SEND ROOM CODE
      socket.emit(
        "privateRoomCreated",
        room.roomId
      );

      // UPDATE PLAYERS
      io.to(room.roomId).emit(
        "players",
        room.players
      );

    }
  );

  // =========================
  // JOIN PRIVATE ROOM
  // =========================
  socket.on(
    "joinPrivateRoom",
    ({
      roomId,
      playerName
    }) => {

      const result =
        joinPrivateRoom(
          roomId,
          socket.id,
          playerName
        );

      // ERROR
      if (result.error) {

        socket.emit(
          "roomError",
          result.error
        );

        return;

      }

      const room =
        result.room;

      socket.join(room.roomId);

      socket.emit(
        "roomJoined",
        room.roomId
      );

      io.to(room.roomId).emit(
        "players",
        room.players
      );

    }
  );

  // =========================
  // START PRIVATE GAME
  // =========================
  socket.on(
    "startGame",
    (roomId) => {

      const room =
        getRoom(roomId);

      if (!room) return;

      // ONLY HOST
      if (
        room.hostId !== socket.id
      ) {

        return;

      }

      // MIN PLAYERS
      if (
        room.players.length < 2
      ) {

        socket.emit(
          "roomError",
          "Minimum 2 players required"
        );

        return;

      }

      startGame(io, room);

    }
  );

  // =========================
  // DRAWER SELECT WORD
  // =========================
  socket.on(
    "selectWord",
    ({
      roomId,
      word
    }) => {

      const room =
        getRoom(roomId);

      if (!room) return;

      // SECURITY
      if (
        room.currentDrawer !==
        socket.id
      ) {

        return;

      }

      selectWord(
        io,
        room,
        word
      );

    }
  );

  // =========================
  // CHAT MESSAGE / GUESS
  // =========================
  socket.on(
    "sendMessage",
    ({
      roomId,
      message,
      playerName
    }) => {

      const room =
        getRoom(roomId);

      if (!room) return;

      // EMPTY MESSAGE
      if (!message.trim()) return;

      // DRAWER CANNOT GUESS
      if (
        socket.id ===
        room.currentDrawer
      ) {

        return;

      }

      // CORRECT GUESS
      if (
        room.currentWord &&
        message.toLowerCase().trim()
        ===
        room.currentWord
          .toLowerCase()
          .trim()
      ) {

        const alreadyGuessed =
  room.guessedPlayers.includes(
    socket.id
  );

if (alreadyGuessed)
  return;

playerGuessed(
  io,
  room,
  socket.id
);

io.to(room.roomId).emit(
  "correctGuess",
  {
    player: playerName
  }
);

        return;

      }

      // NORMAL CHAT
      io.to(room.roomId).emit(
        "receiveMessage",
        {
          playerName,
          message
        }
      );

    }
  );

  // =========================
  // DRAWING
  // =========================
  socket.on(
    "drawing",
    ({
      roomId,
      data
    }) => {

      const room =
        getRoom(roomId);

      if (!room) return;

      // ONLY DRAWER CAN DRAW
      if (
        room.currentDrawer !==
        socket.id
      ) {

        return;

      }

      // SAVE STROKE
      room.canvasData.push(data);

      // SEND TO OTHERS
      socket.to(roomId).emit(
        "drawing",
        data
      );

    }
  );

  // =========================
  // CLEAR CANVAS
  // =========================
  socket.on(
    "clearCanvas",
    (roomId) => {

      const room =
        getRoom(roomId);

      if (!room) return;

      // ONLY DRAWER
      if (
        room.currentDrawer !==
        socket.id
      ) {

        return;

      }

      room.canvasData = [];

      io.to(roomId).emit(
        "clearCanvas"
      );

    }
  );

  // =========================
  // PLAYER DISCONNECT
  // =========================
  socket.on(
    "disconnect",
    () => {

      console.log(
        "Disconnected:",
        socket.id
      );

      for (
        let roomId
        in io.sockets.adapter.rooms
      ) {

        const room =
          getRoom(roomId);

        if (!room) continue;

        const exists =
          room.players.some(
            player =>
              player.id === socket.id
          );

        if (!exists) continue;

        removePlayer(
          roomId,
          socket.id
        );

        // UPDATE PLAYERS
        io.to(roomId).emit(
          "players",
          room.players
        );

        // ROOM EMPTY
        if (
          room.players.length === 0
        ) {

          break;

        }

        // DRAWER LEFT
        if (
          room.currentDrawer ===
          socket.id
        ) {

          startGame(io, room);

        }

        break;

      }

    }
  );



}

module.exports = gameEvents;