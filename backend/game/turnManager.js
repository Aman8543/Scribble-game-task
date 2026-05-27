function nextTurn(room) {
  room.drawerIndex =
    (room.drawerIndex + 1) % room.players.length;

  return room.players[room.drawerIndex];
}

module.exports = nextTurn;