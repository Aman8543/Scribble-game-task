
const {
  rooms
} = require(
  "../rooms/roomManager"
);
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
  playerGuessed,
  nextTurn
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
  ({
    playerName,
    settings
  }) => {

      const room =
        createPrivateRoom(
          socket.id,
          playerName,
          settings
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
//   socket.on(
//     "sendMessage",
//     ({
//       roomId,
//       message,
//       playerName
//     }) => {

//       const room =
//         getRoom(roomId);

//       if (!room) return;

//       // EMPTY MESSAGE
//       if (!message.trim()) return;

//       // DRAWER CANNOT GUESS
//       if (
//         socket.id ===
//         room.currentDrawer
//       ) {

//         return;

//       }

//       // CORRECT GUESS
//       // CORRECT GUESS
// if (
//   room.currentWord &&
//   message.toLowerCase().trim()
//   ===
//   room.currentWord
//     .toLowerCase()
//     .trim()
// ) {

//   const alreadyGuessed =
//     room.guessedPlayers.includes(
//       socket.id
//     );

//   if (alreadyGuessed)
//     return;

//   // ADD PLAYER TO GUESSED
//   room.guessedPlayers.push(
//     socket.id
//   );

//   // UPDATE SCORE
//   playerGuessed(
//     io,
//     room,
//     socket.id
//   );

//   // CHECK IF EVERYONE GUESSED
// const totalGuessers =
//   room.players.length - 1;

// if (
//   room.guessedPlayers.length >=
//   totalGuessers
// ) {

//   // STOP TIMER
//   clearInterval(room.interval);

//   // SMALL DELAY
//   const {
//   nextTurn
// } = require(
//   "../game/gameLoop"
// );

// setTimeout(() => {

//   nextTurn(io, room);

// }, 2000);

// }

//   // SEND TO GUESSER ONLY
//   socket.emit(
//     "correctGuessSelf",
//     {
//       text:
//         `🎉 Correct! The word was "${room.currentWord}"`
//     }
//   );

//   // SEND TO DRAWER ONLY
//   io.to(
//     room.currentDrawer
//   ).emit(
//     "playerGuessed",
//     {
//       text:
//         `${playerName} guessed correctly`
//     }
//   );

//   // SEND TO EVERYONE ELSE
//   socket
//     .to(room.roomId)
//     .emit(
//       "correctGuess",
//       {
//         player: playerName
//       }
//     );

//   return;

// }

//       // NORMAL CHAT

//       // PREVENT WORD LEAKING
// if (
//   room.currentWord &&
//   message
//     .toLowerCase()
//     .includes(
//       room.currentWord.toLowerCase()
//     )
// ) {

//   return;

// }
//       io.to(room.roomId).emit(
//         "receiveMessage",
//         {
//           playerName,
//           message
//         }
//       );

//     }
//   );

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
      in rooms
    ) {

      const room =
        getRoom(roomId);

      if (!room) continue;

      const player =
        room.players.find(
          (p) =>
            p.id === socket.id
        );

      if (!player)
        continue;

      const wasDrawer =
        room.currentDrawer ===
        socket.id;

      // REMOVE PLAYER
      removePlayer(
        roomId,
        socket.id
      );

      // REMOVE FROM GUESSED
      room.guessedPlayers =
        room.guessedPlayers.filter(
          (id) =>
            id !== socket.id
        );

      // UPDATE PLAYERS
      io.to(roomId).emit(
        "players",
        room.players
      );

      // UPDATE LEADERBOARD
      io.to(roomId).emit(
        "leaderboardUpdate",
        room.players
      );

      // SYSTEM MESSAGE
      io.to(roomId).emit(
        "systemMessage",
        {
          text:
            `${player.name} left the room`
        }
      );

      // ROOM EMPTY
      if (
        room.players.length === 0
      ) {

        return;

      }

      // ONLY 1 PLAYER LEFT
      if (
        room.players.length === 1
      ) {

        room.gameStarted =
          false;

        clearInterval(
          room.interval
        );

        io.to(roomId).emit(
          "systemMessage",
          {
            text:
              "Waiting for more players..."
          }
        );

        return;

      }

      // IF DRAWER LEFT
      if (wasDrawer) {

        clearInterval(
          room.interval
        );

        io.to(roomId).emit(
          "systemMessage",
          {
            text:
              "Drawer left. Next round starting..."
          }
        );

        // setTimeout(() => {

        //   startGame(
        //     io,
        //     room
        //   );

        // }, 2000);

        setTimeout(() => {

  nextTurn(io, room);

}, 2000);

      }

      // IF EVERYONE GUESSED AFTER LEAVE
      const guessers =
        room.players.filter(
          (p) =>
            p.id !==
            room.currentDrawer
        );

      if (
        room.guessedPlayers
          .length >=
        guessers.length
      ) {

        clearInterval(
          room.interval
        );

        // setTimeout(() => {

        //   startGame(
        //     io,
        //     room
        //   );

        // }, 2000);

        setTimeout(() => {

  nextTurn(io, room);

}, 2000);

      }

      break;

    }

  }
);



}

module.exports = gameEvents;