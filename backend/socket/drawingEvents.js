function drawingEvents(io, socket) {

  socket.on("drawing", ({ roomId, data }) => {

    socket.to(roomId).emit("drawing", data);

  });

}

module.exports = drawingEvents;
