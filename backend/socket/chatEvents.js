const { getRoom } = require("../rooms/roomManager");
const addScore = require("../game/scoreManager");

function chatEvents(io, socket) {

  socket.on("sendMessage", ({ roomId, message, playerName }) => {

    const room = getRoom(roomId);

    if (!room) return;

    if (message.toLowerCase() === room.currentWord.toLowerCase()) {

      const player = room.players.find(
        p => p.id === socket.id
      );

      addScore(player, 10);

      io.to(roomId).emit("correctGuess", {
        player: player.name
      });

    } else {

      io.to(roomId).emit("receiveMessage", {
        playerName,
        message
      });

    }

  });

}

module.exports = chatEvents;
