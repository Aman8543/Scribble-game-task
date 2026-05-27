const {
  rooms,
  createRoom
} = require("./roomManager");

function findPublicRoom(
  socketId,
  playerName
) {

  // FIND EXISTING ROOM
  for (let roomId in rooms) {

    const room = rooms[roomId];

    // ONLY PUBLIC
    if (room.isPrivate)
      continue;

    // ROOM FULL
    if (
      room.players.length >=
      room.maxPlayers
    ) {

      continue;

    }

    // PLAYER ALREADY EXISTS
    const exists =
      room.players.some(
        player =>
          player.id === socketId
      );

    if (exists) {

      return room;

    }
    
if (
  room.players.length >=
  room.maxPlayers
) {

  return {
    error: "Room is full"
  };

}
    // ADD PLAYER
    room.players.push({

      id: socketId,

      name: playerName,

      score: 0,

      guessed: false,

      isHost: false

    });

    return room;

  }

  // CREATE NEW ROOM
  const roomId =
    "public-" + Date.now();

  const room = createRoom(
    roomId,
    socketId,
    playerName,
    false
  );

  // ADD HOST
  room.players.push({

    id: socketId,

    name: playerName,

    score: 0,

    guessed: false,

    isHost: true

  });

  return room;

}

module.exports = {
  findPublicRoom
};