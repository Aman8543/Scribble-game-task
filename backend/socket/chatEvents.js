const { getRoom } = require("../rooms/roomManager");

const addScore = require("../game/scoreManager");

const {
    nextTurn
  } = require(
    "../game/gameLoop"
  );

function chatEvents(io, socket) {

  socket.on(
    "sendMessage",
    ({ roomId, message, playerName }) => {

      const room = getRoom(roomId);

      if (!room) return;

      // CLEAN MESSAGE
      const cleanMessage =
        message.trim().toLowerCase();

      // CHECK CORRECT GUESS
      if (
        cleanMessage ===
        room.currentWord.toLowerCase()
      ) {

        console.log("CORRECT GUESS");

        const player = room.players.find(
          (p) => p.id === socket.id
        );

        console.log(
          "FOUND PLAYER:",
          player
        );

        if (!player) return;

        // SAFETY
        if (!room.guessedPlayers) {
          room.guessedPlayers = [];
        }

        // PREVENT DRAWER GUESS
        if (socket.id === room.drawerId) {
          return;
        }

        console.log(
          "guessedPlayers ARRAY:",
          room.guessedPlayers
        );

        // PREVENT DOUBLE GUESS
        const alreadyGuessed =
          room.guessedPlayers.includes(
            socket.id
          );

        console.log(
          "ALREADY GUESSED:",
          alreadyGuessed
        );

        if (alreadyGuessed) {
          return;
        }

        // SAVE PLAYER
        room.guessedPlayers.push(
          socket.id
        );

        console.log(
          "CALLING ADD SCORE"
        );

        console.log(
          "Before Score:",
          player.name,
          player.score
        );

        // ADD SCORE
        addScore(player, 10);

        console.log(
          "UPDATED SCORE:",
          player.score
        );

        // =========================
// EVERYONE GUESSED
// =========================

const totalGuessers =
  room.players.length - 1;

if (
  room.guessedPlayers.length >=
  totalGuessers
) {

  console.log(
    "EVERYONE GUESSED"
  );

   if (room.turnChanging)
    return;

  room.turnChanging = true;
  // STOP TIMER
  clearInterval(
    room.interval
  );

  

  setTimeout(() => {

  console.log(
    "CALLING NEXT TURN"
  );

  room.turnChanging = false;

  nextTurn(io, room);

}, 2000);
}

        // // SEND UPDATED ROOM
        // io.to(roomId).emit(
        //   "roomUpdated",
        //   room
        // );

        io.to(roomId).emit(
  "roomUpdated",
  {
    players: room.players,
    currentDrawer:
      room.currentDrawer,
    currentRound:
      room.currentRound,
    timer: room.timer,
    gameStarted:
      room.gameStarted
  }
);
        // SEND TO PLAYER ONLY
        socket.emit(
          "correctGuessSelf",
          {
            text: `🎉 Correct! The word was "${room.currentWord}"`
          }
        );

        // SEND TO DRAWER ONLY
        io.to(room.drawerId).emit(
          "playerGuessed",
          {
            text: `${player.name} guessed correctly`
          }
        );

        // SEND TO OTHERS
        socket
          .to(roomId)
          .emit("correctGuess", {
            player: player.name
          });

        return;
      }

      // NORMAL MESSAGE
      io.to(roomId).emit(
        "receiveMessage",
        {
          playerName,
          message
        }
      );

    }
  );

}

module.exports = chatEvents;