import {
  useContext,
  useEffect,
  useState
} from "react";
import CreateRoomModal from "../components/CreateRoomModal";
import { useNavigate } from "react-router-dom";

import socket from "../socket/socket";

import { GameContext } from "../context/GameContext";

import {
  Gamepad2,
  Users,
  Lock,
  ArrowRight,
  Copy
} from "lucide-react";

function Lobby() {
  const [openModal, setOpenModal] =useState(false);
  const navigate = useNavigate();

  const {
    playerName,
    setRoomId,
    setPlayerName
  } = useContext(GameContext);

  const [privateCode, setPrivateCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // SOCKET LISTENERS
  // =========================
  useEffect(() => {

    // ROOM JOINED
    socket.on(
      "roomJoined",
      (roomId) => {

        setLoading(false);

        setRoomId(roomId);

        navigate("/game");

      }
    );

    // PRIVATE ROOM CREATED
    socket.on(
      "privateRoomCreated",
      (roomId) => {

        setLoading(false);

        setRoomId(roomId);

        navigate("/game");

      }
    );

    // ROOM ERROR
    socket.on(
      "roomError",
      (message) => {

        setLoading(false);

        setError(message);

      }
    );

    return () => {

      socket.off("roomJoined");

      socket.off("privateRoomCreated");

      socket.off("roomError");

    };

  }, []);

  // =========================
  // JOIN PUBLIC
  // =========================
  const joinPublic = () => {

    if (!playerName.trim()) {

      setError(
        "Please enter your name"
      );

      return;

    }

    setError("");

    setLoading(true);

    socket.emit(
      "joinPublicRoom",
      playerName
    );

  };

  // =========================
  // CREATE PRIVATE
  // =========================
  const createPrivate = () => {

    if (!playerName.trim()) {

      setError(
        "Please enter your name"
      );

      return;

    }

    setError("");

    setLoading(true);

    socket.emit(
      "createPrivateRoom",
      playerName
    );

  };

  // =========================
  // JOIN PRIVATE
  // =========================
  const joinPrivate = () => {

    if (!playerName.trim()) {

      setError(
        "Please enter your name"
      );

      return;

    }

    if (!privateCode.trim()) {

      setError(
        "Enter room code"
      );

      return;

    }

    setError("");

    setLoading(true);

    socket.emit(
      "joinPrivateRoom",
      {
        roomId:
          privateCode.toUpperCase(),
        playerName
      }
    );

  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center">

          <div className="space-y-6">

            <div className="flex items-center gap-4">

              <div className="p-5 rounded-3xl bg-primary text-primary-content shadow-2xl">

                <Gamepad2 size={50} />

              </div>

              <div>

                <h1 className="text-6xl font-black">
                  Skribbl
                </h1>

                <p className="text-xl opacity-70">
                  Multiplayer Drawing Game
                </p>

              </div>

            </div>

            <div className="space-y-4 text-lg opacity-80">

              <div className="flex items-center gap-3">

                🎨 Draw and guess words

              </div>

              <div className="flex items-center gap-3">

                ⚡ Realtime multiplayer

              </div>

              <div className="flex items-center gap-3">

                🏆 Compete with friends

              </div>

              <div className="flex items-center gap-3">

                🌎 Public & private rooms

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="card bg-base-100 shadow-2xl border border-base-300">

          <div className="card-body p-8">

            {/* MOBILE LOGO */}
            <div className="lg:hidden text-center mb-6">

              <div className="inline-flex p-4 rounded-3xl bg-primary text-primary-content mb-4">

                <Gamepad2 size={40} />

              </div>

              <h1 className="text-4xl font-black">
                Skribbl
              </h1>

            </div>

            {/* TITLE */}
            <div className="mb-8">

              <h2 className="text-4xl font-black">
                Join Game
              </h2>

              <p className="opacity-70 mt-2">
                Play with friends in realtime
              </p>

            </div>

            {/* ERROR */}
            {
              error && (

                <div className="alert alert-error mb-5">

                  <span>{error}</span>

                </div>

              )
            }

            {/* NAME INPUT */}
            <div className="form-control mb-6">

              <label className="label">

                <span className="label-text text-lg font-semibold">

                  Your Name

                </span>

              </label>

              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered input-lg rounded-2xl"
                value={playerName}
                onChange={(e) =>
                  setPlayerName(
                    e.target.value
                  )
                }
              />

            </div>

            {/* PUBLIC BUTTON */}
            <button
              className={`btn btn-primary btn-lg rounded-2xl w-full mb-5 ${
                loading
                  ? "btn-disabled"
                  : ""
              }`}
              onClick={joinPublic}
            >

              <Users size={22} />

              Play Public

            </button>

            {/* DIVIDER */}
            <div className="divider text-sm opacity-60">
              OR
            </div>

            {/* CREATE PRIVATE */}
            <button     className={`btn btn-accent btn-lg rounded-2xl w-full bg-green-700 border-green-700 text-gray-300 mb-10 `}
  onClick={() =>
    setOpenModal(true)
  }
>
  Create Private Room
</button>

            {/* ROOM CODE */}
            <div className="form-control mb-5">

              <label className="label">

                <span className="label-text text-lg font-semibold pr-2">

                  Room Code

                </span>

              </label>

              <input
                type="text"
                placeholder="Enter room code"
                className="input input-bordered input-lg rounded-2xl uppercase"
                value={privateCode}
                onChange={(e) =>
                  setPrivateCode(
                    e.target.value
                  )
                }
              />

            </div>

            {/* JOIN PRIVATE */}
            <button
              className={`btn btn-accent btn-lg rounded-2xl w-full ${
                loading
                  ? "btn-disabled"
                  : ""
              }`}
              onClick={joinPrivate}
            >

              <ArrowRight size={22} />

              Join Private Room

            </button>

          </div>

        </div>

      </div>

    <CreateRoomModal
  open={openModal}
  onClose={() =>
    setOpenModal(false)
  }
  onCreate={(settings) => {

    socket.emit(
      "createPrivateRoom",
      {
        playerName,
        settings
      }
    );

    setOpenModal(false);

  }}
/>
    </div>
  
  
  
);
}

export default Lobby;