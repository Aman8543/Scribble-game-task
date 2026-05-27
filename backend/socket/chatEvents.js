const { getRoom } = require("../rooms/roomManager");

const addScore = require("../game/scoreManager");

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

        const player = room.players.find(
          (p) => p.id === socket.id
        );

        if (!player) return;

        // PREVENT DOUBLE SCORE
        if (player.guessedCorrectly) return;

        player.guessedCorrectly = true;

        // ADD SCORE
        addScore(player, 10);

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