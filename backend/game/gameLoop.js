const {
  getWordChoices
} = require("./wordManager");

// =========================
// START GAME
// =========================
function startGame(io, room) {

  if (
    !room.players ||
    room.players.length < 2
  ) {

    return;

  }

  room.gameStarted = true;

  room.gameEnded = false;

  room.currentRound = 1;

  room.drawnPlayers = [];

 room.drawerIndex = -1; 

  

 nextTurn(io, room);

}

// =========================
// START TURN
// =========================
function startTurn(io, room) {


  

  // SAFETY
  if (
    !room.players ||
    room.players.length === 0
  ) {

    return;

  }

  // FIX INDEX
  if (
    room.drawerIndex >=
    room.players.length
  ) {

    room.drawerIndex = 0;

  }

  const drawer =
    room.players[
      room.drawerIndex
    ];

  // SAFETY
  if (!drawer) {

    console.log(
      "Drawer not found"
    );

    return;

  }

  console.log(
    "DRAWER SOCKET:",
    drawer.id
  );

  // RESET TURN STATE
 
  room.currentDrawer =
    drawer.id;

  room.currentWord = "";

  room.wordChoices = [];

  room.guessedPlayers = [];

  room.timer =
    room.drawTime || 60;

  // SEND PLAYERS
  io.to(room.roomId).emit(
    "players",
    room.players
  );

  // ROUND UPDATE
  io.to(room.roomId).emit(
    "roundUpdate",
    {
      currentRound:
        room.currentRound,

      maxRounds:
        room.maxRounds
    }
  );

  // SEND DRAWER
  io.to(room.roomId).emit(
    "newDrawer",
    {
      id: drawer.id,
      name: drawer.name
    }
  );

  // WORD CHOICES
  const choices =
    getWordChoices(room);

  room.wordChoices =
    choices;

  // SEND TO DRAWER ONLY
  io.to(drawer.id).emit(
    "wordChoices",
    choices
  );

  console.log(
    "Word choices sent to:",
    drawer.name
  );

  // AUTO SELECT WORD
  clearTimeout(
    room.wordSelectTimeout
  );

  room.wordSelectTimeout =
    setTimeout(() => {

      // WORD ALREADY SELECTED
      if (room.currentWord)
        return;

      const randomWord =
        choices[
          Math.floor(
            Math.random() *
            choices.length
          )
        ];

      selectWord(
        io,
        room,
        randomWord
      );

    }, 10000);

}

// =========================
// SELECT WORD
// =========================
function selectWord(
  io,
  room,
  word
) {

  clearTimeout(
    room.wordSelectTimeout
  );

  room.currentWord = word;

  // HIDE CHOICES
  io.to(room.roomId).emit(
    "wordSelected"
  );

  // SEND WORD TO DRAWER
  io.to(room.currentDrawer).emit(
    "yourTurn",
    word
  );

  // START TIMER
  startTimer(io, room);

}

// =========================
// START TIMER
// =========================
function startTimer(io, room) {

  if (room.interval) {
  clearInterval(room.interval);
  room.interval = null;
}

  room.interval =
    setInterval(() => {

      room.timer--;

      const hint =
        generateHint(
          room.currentWord,
          room.timer
        );

      io.to(room.roomId).emit(
        "timerUpdate",
        {
          time: room.timer,
          hint
        }
      );

      // TIMER END
      if (room.timer <= 0) {

        clearInterval(
          room.interval
        );

        nextTurn(io, room);

      }

    }, 1000);

}

// =========================
// PLAYER GUESSED
// =========================
function playerGuessed(
  io,
  room,
  socketId
) {

  if (room.turnChanging) {
    return;
  }

  // PREVENT DUPLICATE
  if (
    room.guessedPlayers.includes(
      socketId
    )
  ) {
    return;
  }

  // DRAWER CANNOT GUESS
  if (
    socketId ===
    room.currentDrawer
  ) {
    return;
  }

 

  const player =
    room.players.find(
      p => p.id === socketId
    );

  if (!player) {
    return;
  }

  // SCORE
  player.score += 10;

  io.to(room.roomId).emit(
    "players",
    room.players
  );

  // TOTAL NON-DRAWERS
  const totalGuessers =
    room.players.length - 1;

  console.log(
    "GUESSED:",
    room.guessedPlayers.length
  );

  console.log(
    "TOTAL:",
    totalGuessers
  );

  // ALL GUESSED
  if (
    room.guessedPlayers.length >=
    totalGuessers
  ) {

    console.log(
      "ALL GUESSED"
    );

    nextTurn(io, room);

  }

}

// =========================
// NEXT TURN
// =========================
function nextTurn(io, room) {

  // BLOCK MULTIPLE CALLS
  if (room.turnChanging) {
    return;
  }

  room.turnChanging = true;

  // CLEAR GAME TIMER
  if (room.interval) {
    clearInterval(room.interval);
    room.interval = null;
  }

  // CLEAR WORD TIMER
  if (room.wordSelectTimeout) {
    clearTimeout(room.wordSelectTimeout);
    room.wordSelectTimeout = null;
  }

  // CLEAR OLD TURN DATA
  room.currentWord = "";

  room.wordChoices = [];

  room.guessedPlayers = [];

  // NEXT PLAYER
  room.drawerIndex++;

  // ROUND COMPLETE
  if (
    room.drawerIndex >=
    room.players.length
  ) {

    room.drawerIndex = 0;

    room.currentRound++;

  }

  console.log(
    "NEXT DRAWER INDEX:",
    room.drawerIndex
  );

  console.log(
    "NEXT DRAWER:",
    room.players[
      room.drawerIndex
    ]?.name
  );

  // GAME END
  if (
    room.currentRound >
    room.maxRounds
  ) {

    endGame(io, room);

    return;

  }

  // CLEAR FRONTEND
  io.to(room.roomId).emit(
    "clearCanvas"
  );

  io.to(room.roomId).emit(
    "clearWord"
  );

  // IMPORTANT
  io.to(room.roomId).emit(
    "wordSelected"
  );

  // WAIT
  setTimeout(() => {

    startTurn(io, room);

    room.turnChanging = false;

  }, 1500);

}
// =========================
// END GAME
// =========================
function endGame(io, room) {

  room.gameStarted = false;

  room.gameEnded = true;

  if (room.interval) {
  clearInterval(room.interval);
  room.interval = null;
}

  clearTimeout(
    room.wordSelectTimeout
  );

  // SORT PLAYERS
  const leaderboard =
    [...room.players].sort(
      (a, b) =>
        b.score - a.score
    );

  room.leaderboard =
    leaderboard;

  room.winner =
    leaderboard[0];

  io.to(room.roomId).emit(
    "gameEnded",
    {
      winner: room.winner,
      leaderboard
    }
  );

}

// =========================
// GENERATE HINT
// =========================
function generateHint(
  word,
  timer
) {

  if (!word)
    return "";

  const letters =
    word.split("");

  let hint =
    letters.map(() => "_");

  // AFTER 10 SEC
  if (timer <= 50) {

    hint[0] = letters[0];

  }

  // AFTER 20 SEC
  if (timer <= 40) {

    hint[
      letters.length - 1
    ] =
      letters[
        letters.length - 1
      ];

  }

  return hint.join(" ");

}

module.exports = {

  startGame,

  selectWord,

  playerGuessed,

  nextTurn

};