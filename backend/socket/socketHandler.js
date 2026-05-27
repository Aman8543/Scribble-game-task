const gameEvents = require("./gameEvents");
const drawingEvents = require("./drawingEvents");
const chatEvents = require("./chatEvents");

function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    gameEvents(io, socket);

    drawingEvents(io, socket);

    chatEvents(io, socket);

    socket.on("disconnect", () => {

      console.log("User disconnected:", socket.id);

    });

  });

}

module.exports = socketHandler;