const nextRound =
  require("./nextRound");

function startTimer(io, room) {

  clearInterval(room.interval);

  room.timer =
    room.drawTime || 60;

  room.interval =
    setInterval(() => {

      room.timer--;

      io.to(room.roomId).emit(
        "timerUpdate",
        room.timer
      );

      if (room.timer <= 0) {

        clearInterval(
          room.interval
        );

        room.interval = null;

        io.to(room.roomId).emit(
          "turnEnded"
        );

        nextRound(io, room);

      }

    }, 1000);

}

module.exports = startTimer;