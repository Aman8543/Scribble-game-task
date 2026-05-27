import {
  useContext,
  useEffect,
  useState
} from "react";

import socket from "../socket/socket";

import { GameContext }
from "../context/GameContext";

import Canvas from "../components/Canvas";
import Chat from "../components/Chat";
import PlayerList from "../components/PlayerList";
import ScoreBoard from "../components/ScoreBoard";
import WordSelection from "../components/WordSelection";

import {
  Users,
  Timer,
  Crown,
  Wifi,
  Gamepad2,
  Trophy,
  Layers
} from "lucide-react";

function GameRoom() {

  const [roomLoaded, setRoomLoaded] = useState(false);
  const [hint,setHint] = useState("");
  const {
    roomId,

    players,
    setPlayers,

    timer,
    setTimer,

    word,
    setWord,

    playerName
  } = useContext(GameContext);

  // =========================
  // STATES
  // =========================
  const [drawer,
    setDrawer] =
    useState("");

  const [
    currentDrawerId,
    setCurrentDrawerId
  ] = useState("");

  const [connected,
    setConnected] =
    useState(false);

  const [round,
    setRound] =
    useState(1);

  const [maxRounds,
    setMaxRounds] =
    useState(5);

  const [wordChoices,
    setWordChoices] =
    useState([]);

  const [gameEnded,
    setGameEnded] =
    useState(false);

  const [winner,
    setWinner] =
    useState(null);

  const [leaderboard,
    setLeaderboard] =
    useState([]);

  // =========================
  // PLAYER ROLES
  // =========================
  const isDrawer =
    socket.id ===
    currentDrawerId;

    console.log("drawer",isDrawer);

  const isHost =
    players[0]?.name ===
    playerName;

  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    
    // INITIAL STATUS
    setConnected(
      socket.connected
    );

    // CONNECT
    socket.on(
      "connect",
      () => {

        setConnected(true);

      }
    );

    // DISCONNECT
    socket.on(
      "disconnect",
      () => {

        setConnected(false);

      }
    );

    // PLAYERS
   socket.on(
  "players",
  (updatedPlayers) => {

    console.log(
      "Updated Players:",
      updatedPlayers
    );

    setPlayers(
      updatedPlayers
    );

    setRoomLoaded(true);

  }
);

    // TIMER
    socket.on(
  "timerUpdate",
  ({
    time,
    hint
  }) => {

    setTimer(time);

    setHint(hint);

  }
);
    // WORD FOR DRAWER
    socket.on(
      "yourTurn",
      (newWord) => {

        setWord(newWord);

      }
    );

    // DRAWER INFO
    socket.on(
      "newDrawer",
      ({
        name,
        id
      }) => {

        setDrawer(name);

        setCurrentDrawerId(id);

      }
    );

    // WORD CHOICES
    socket.on(
      "wordChoices",
      (choices) => {

        setWordChoices(
          choices
        );

      }
    );

    // WORD SELECTED
    socket.on(
      "wordSelected",
      () => {

        setWordChoices([]);

      }
    );

    // CLEAR WORD
    socket.on(
      "clearWord",
      () => {

        setWord("");

        setWordChoices([]);

      }
    );

    // ROUND UPDATE
    socket.on(
      "roundUpdate",
      ({
        currentRound,
        maxRounds
      }) => {

        setRound(
          currentRound
        );

        setMaxRounds(
          maxRounds
        );

      }
    );

    // GAME ENDED
    socket.on(
      "gameEnded",
      (data) => {

        setGameEnded(true);

        setWinner(
          data.winner
        );

        setLeaderboard(
          data.leaderboard
        );

      }
    );

    // CORRECT GUESS
    socket.on(
      "correctGuess",
      ({ player }) => {

        console.log(
          `${player} guessed correctly`
        );

      }
    );

    // CLEANUP
    return () => {

      socket.off("connect");

      socket.off("disconnect");

      socket.off("players");

      socket.off("timerUpdate");

      socket.off("yourTurn");

      socket.off("newDrawer");

      socket.off("wordChoices");

      socket.off("wordSelected");

      socket.off("clearWord");

      socket.off("roundUpdate");

      socket.off("gameEnded");

      socket.off("correctGuess");

      socket.off("roomState");

    };

    socket.on(
  "roomState",
  (data) => {

    console.log(
      "ROOM STATE:",
      data
    );

    // PLAYERS
    setPlayers(
      data.players || []
    );

    // TIMER
    setTimer(
      data.timer || 60
    );

    // ROUND
    setRound(
      data.currentRound || 1
    );

    setMaxRounds(
      data.maxRounds || 5
    );

    // DRAWER
    if (data.currentDrawer) {

      setDrawer(
        data.currentDrawer.name
      );

      setCurrentDrawerId(
        data.currentDrawer.id
      );

    }

    setRoomLoaded(true);

  }
);

  }, []);

  // =========================
  // START GAME
  // =========================
  const startGame = () => {

    setGameEnded(false);

    socket.emit(
      "startGame",
      roomId
    );

  };

  
  

  // =========================
  // GAME OVER SCREEN
  // =========================
  if (gameEnded) {

    return (

      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

        <div className="card bg-base-100 shadow-2xl border border-base-300 w-full max-w-2xl">

          <div className="card-body">

            {/* TITLE */}
            <div className="text-center mb-8">

              <div className="inline-flex p-5 rounded-full bg-warning text-warning-content mb-5">

                <Trophy size={60} />

              </div>

              <h1 className="text-5xl font-black">

                Game Over

              </h1>

              <p className="opacity-70 mt-3">

                Winner of this match

              </p>

            </div>

            {/* WINNER */}
            <div className="text-center mb-8">

              <div className="text-4xl font-black text-primary">

                🏆 {winner?.name}

              </div>

              <div className="text-xl mt-2 opacity-70">

                Score: {winner?.score}

              </div>

            </div>

            {/* LEADERBOARD */}
            <div>

              <h2 className="text-2xl font-bold mb-5">

                Leaderboard

              </h2>

              <div className="space-y-3">

                {
                  leaderboard.map(
                    (player, index) => (

                      <div
                        key={player.id}
                        className="flex items-center justify-between bg-base-200 rounded-2xl px-5 py-4"
                      >

                        <div className="flex items-center gap-4">

                          <div className="text-2xl font-black">

                            #{index + 1}

                          </div>

                          <div className="font-bold text-lg">

                            {player.name}

                          </div>

                        </div>

                        <div className="badge badge-primary badge-lg">

                          {player.score}

                        </div>

                      </div>

                    )
                  )
                }

              </div>

              {/* PLAY AGAIN */}
              {
                isHost && (

                  <button
                    className="btn btn-primary btn-lg rounded-2xl w-full mt-8"
                    onClick={startGame}
                  >

                    Play Again

                  </button>

                )
              }

            </div>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-base-200 overflow-x-hidden relative">

      {
  roomLoaded &&
  players.length < 2 && (

    <div className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">

      <div className="card bg-base-100 shadow-2xl border border-base-300 w-full max-w-lg">

        <div className="card-body text-center">

          <div className="text-7xl mb-5">

            🎮

          </div>

          <h1 className="text-4xl font-black">

            Waiting for Players

          </h1>

          <p className="opacity-70 mt-3 text-lg">

            Minimum 2 players required

          </p>

          <div className="badge badge-primary badge-lg mt-6 p-4">

            Room: {roomId}

          </div>

        </div>

      </div>

    </div>

  )
}

      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-base-100/80 border-b border-base-300 shadow-md">

        <div className="max-w-[1800px] mx-auto px-4 py-3">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* LEFT */}
            <div className="flex flex-col gap-2">

              <div className="flex items-center gap-3">

                <div className="p-3 rounded-2xl bg-primary text-primary-content shadow-lg">

                  <Gamepad2 size={28} />

                </div>

                <div>

                  <h1 className="text-2xl sm:text-4xl font-black">

                    Skribbl Clone

                  </h1>

                  <p className="text-sm opacity-70">

                    Realtime Multiplayer Drawing Game

                  </p>

                </div>

              </div>

              {/* BADGES */}
              <div className="flex flex-wrap gap-2 mt-1">

                <div className="badge badge-primary badge-lg p-4">

                  Room: {roomId}

                </div>

                <div
                  className={`badge badge-lg p-4 ${
                    connected
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >

                  <Wifi size={14} />

                  {
                    connected
                      ? "Connected"
                      : "Disconnected"
                  }

                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap gap-3">

              {/* TIMER */}
              <div className="stat bg-base-100 rounded-3xl shadow-lg border border-base-300 w-[140px]">

                <div className="stat-title flex items-center gap-2">

                  <Timer size={16} />

                  Timer

                </div>

                <div className="stat-value text-primary text-4xl">

                  {timer}

                </div>

              </div>

              {/* PLAYERS */}
              <div className="stat bg-base-100 rounded-3xl shadow-lg border border-base-300 w-[140px]">

                <div className="stat-title flex items-center gap-2">

                  <Users size={16} />

                  Players

                </div>

                <div className="stat-value text-secondary text-4xl">

                  {players.length}

                </div>

              </div>

              {/* ROUND */}
              <div className="stat bg-base-100 rounded-3xl shadow-lg border border-base-300 w-[140px]">

                <div className="stat-title flex items-center gap-2">

                  <Layers size={16} />

                  Round

                </div>

                <div className="stat-value text-accent text-4xl">

                  {round}/{maxRounds}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className="max-w-[1800px] mx-auto p-4">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* LEFT SIDEBAR */}
          <div className="xl:col-span-3 flex flex-col gap-5">

            {/* DRAWER */}
            <div className="card bg-base-100 shadow-2xl border border-base-300">

              <div className="card-body">

                <div className="flex items-center gap-2">

                  <Crown className="text-warning" />

                  <h2 className="card-title">

                    Current Drawer

                  </h2>

                </div>

                <div className="mt-2 text-2xl font-black text-primary break-words">

                  {drawer || "Waiting..."}

                </div>

              </div>

            </div>

            {/* START BUTTON */}
            {
              isHost &&
              players.length >= 2 &&
              !word &&
              !gameEnded && (

                <button
                  className="btn btn-primary btn-lg rounded-2xl"
                  onClick={startGame}
                >

                  Start Game

                </button>

              )
            }

            {/* WORD */}
            <div className="card bg-base-100 shadow-2xl border border-base-300">

              <div className="card-body">

                {
  !isDrawer &&
  hint && (

    <div className="card bg-base-100 shadow-xl border border-base-300">

      <div className="card-body">

        <h2 className="font-bold text-lg">

          Hint

        </h2>

        <div className="text-3xl font-black tracking-widest text-primary">

          {hint}

        </div>

      </div>

    </div>

  )
}

                <WordSelection
                
                  word={
                    isDrawer
                      ? word
                      : ""
                  }
                  wordChoices={
                    wordChoices
                  }
                  roomId={roomId}
                />

              </div>

            </div>

            {/* PLAYERS */}
            <div className="card bg-base-100 shadow-2xl border border-base-300">

              <div className="card-body">

                <PlayerList
                  players={players}
                />

              </div>

            </div>

            {/* SCOREBOARD */}
            <div className="card bg-base-100 shadow-2xl border border-base-300">

              <div className="card-body">

                <ScoreBoard
                  players={players}
                />

              </div>

            </div>

          </div>

          {/* CANVAS */}
          <div className="xl:col-span-6">

            <div className="card bg-base-100 shadow-2xl border border-base-300 h-full">

              <div className="card-body p-2 sm:p-4">

                <Canvas
                  roomId={roomId}
                  isDrawer={isDrawer}
                />

              </div>

            </div>

          </div>

          {/* CHAT */}
          <div className="xl:col-span-3">

            <div className="card bg-base-100 shadow-2xl border border-base-300 h-full min-h-[500px]">

              <div className="card-body h-full flex flex-col">

                <Chat
                  roomId={roomId}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default GameRoom;