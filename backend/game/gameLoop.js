const {
  getWordChoices
} = require("./wordManager");

// =========================
// START GAME / ROUND
// =========================
function startGame(io, room) {

  if (room.players.length < 2)
    return;

  room.gameStarted = true;

  room.gameEnded = false;

  // RESET TIMER
  room.timer =
    room.drawTime || 60;

  // RESET GUESSES
  room.guessedPlayers = [];

  // SELECT DRAWER
  const drawer =
    room.players[room.drawerIndex];

  room.currentDrawer =
    drawer.id;

  // RESET WORD
  room.currentWord = "";

  // CLEAR OLD WORD CHOICES
  room.wordChoices = [];

  // SEND PLAYER UPDATE
  io.to(room.roomId).emit(
    "players",
    room.players
  );

  // SEND CURRENT DRAWER
  io.to(room.roomId).emit(
  "newDrawer",
  {
    name: drawer.name,
    id: drawer.id
  }
);

  // SEND ROUND
  io.to(room.roomId).emit(
    "roundUpdate",
    {
      currentRound:
        room.currentRound,
      maxRounds:
        room.maxRounds
    }
  );

  // GET 3 WORDS
  const choices =
    getWordChoices();

  room.wordChoices =
    choices;

  // SEND WORD CHOICES
  io.to(drawer.id).emit(
    "wordChoices",
    choices
  );

  // AUTO SELECT AFTER 10 SEC
  room.wordSelectTimeout =
    setTimeout(() => {

      // IF STILL NO WORD
      if (!room.currentWord) {

        const autoWord =
          choices[
            Math.floor(
              Math.random() *
              choices.length
            )
          ];

        selectWord(
          io,
          room,
          autoWord
        );

      }

    }, 10000);

}

// =========================
// DRAWER SELECT WORD
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

  // HIDE WORD CHOICES
  io.to(room.roomId).emit(
    "wordSelected"
  );

  // SEND WORD ONLY TO DRAWER
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

  clearInterval(room.interval);

  room.interval = setInterval(() => {

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

    // TIMER FINISHED
    if (room.timer <= 0) {

      clearInterval(
        room.interval
      );

      nextRound(io, room);

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

  // ALREADY GUESSED
  if (
    room.guessedPlayers.includes(
      socketId
    )
  ) {

    return;

  }

  room.guessedPlayers.push(
    socketId
  );

  const player =
    room.players.find(
      p => p.id === socketId
    );

  if (!player) return;

  // SCORE
  player.score += 10;

  // UPDATE PLAYERS
  io.to(room.roomId).emit(
    "players",
    room.players
  );

  // ALL GUESSED
  const guessers =
    room.players.filter(
      p =>
        p.id !==
        room.currentDrawer
    );

  if (
    room.guessedPlayers.length
    >=
    guessers.length
  ) {

    clearInterval(
      room.interval
    );

    nextRound(io, room);

  }

}

// =========================
// NEXT ROUND
// =========================
function nextRound(io, room) {

  // CLEAR CANVAS
  io.to(room.roomId).emit(
    "clearCanvas"
  );

  // CLEAR WORD
  io.to(room.roomId).emit(
    "clearWord"
  );

  room.currentWord = "";

  room.wordChoices = [];

  // NEXT DRAWER
  room.drawerIndex =
    (room.drawerIndex + 1)
    %
    room.players.length;

  // ROUND COMPLETE
  if (room.drawerIndex === 0) {

    room.currentRound++;

  }

  // GAME END
  if (
    room.currentRound >
    room.maxRounds
  ) {

    endGame(io, room);

    return;

  }

  // START AGAIN
  startGame(io, room);

}

// =========================
// END GAME
// =========================
function endGame(io, room) {

  room.gameStarted = false;

  room.gameEnded = true;

  clearInterval(room.interval);

  // SORT LEADERBOARD
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

module.exports = {

  startGame,

  selectWord,

  playerGuessed

};

function generateHint(
  word,
  timer
) {

  const letters =
    word.split("");

  // HIDE ALL
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