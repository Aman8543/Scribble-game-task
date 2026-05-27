function startTimer(io, room) {
  room.timer = 60;

  const interval = setInterval(() => {
    room.timer--;

    io.to(room.roomId).emit("timerUpdate", room.timer);

    if (room.timer <= 0) {
      clearInterval(interval);

      io.to(room.roomId).emit("turnEnded");
    }
  }, 1000);
}

module.exports = startTimer;
