import { useContext, useState } from "react";

import { useNavigate } from "react-router-dom";

import { GameContext } from "../context/GameContext";

import {
  Pencil,
  Gamepad2,
  Sparkles
} from "lucide-react";

function Home() {

  const navigate = useNavigate();
  
  const {
    playerName,
    setPlayerName
  } = useContext(GameContext);

  const [error, setError] =
    useState("");

  const handleContinue = () => {

    if (!playerName.trim()) {

      setError(
        "Please enter your name"
      );

      return;

    }

    navigate("/lobby");

  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center overflow-hidden relative">

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 opacity-20">

        <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>

        <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary rounded-full blur-3xl"></div>

      </div>

      {/* MAIN CARD */}
      <div className="relative z-10 w-full max-w-md p-4">

        <div className="card bg-base-100 shadow-2xl border border-base-300">

          <div className="card-body p-8">

            {/* LOGO */}
            <div className="flex flex-col items-center text-center mb-8">

              <div className="p-5 rounded-3xl bg-primary text-primary-content shadow-2xl mb-5">

                <Gamepad2 size={60} />

              </div>

              <h1 className="text-5xl font-black">

                Skribbl

              </h1>

              <p className="opacity-70 mt-3">

                Real-time multiplayer drawing game

              </p>

            </div>

            {/* FEATURES */}
            <div className="space-y-3 mb-8">

              <div className="flex items-center gap-3">

                <Sparkles
                  className="text-primary"
                  size={18}
                />

                <span>
                  Draw and guess with friends
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Sparkles
                  className="text-secondary"
                  size={18}
                />

                <span>
                  Realtime multiplayer gameplay
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Sparkles
                  className="text-accent"
                  size={18}
                />

                <span>
                  Public & private rooms
                </span>

              </div>

            </div>

            {/* ERROR */}
            {
              error && (

                <div className="alert alert-error mb-5">

                  <span>{error}</span>

                </div>

              )
            }

            {/* INPUT */}
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
                onChange={(e) => {

                  setPlayerName(
                    e.target.value
                  );

                  setError("");

                }}
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    handleContinue();

                  }

                }}
              />

            </div>

            {/* BUTTON */}
            <button
              className="btn btn-primary btn-lg rounded-2xl w-full"
              onClick={handleContinue}
            >

              <Pencil size={20} />

              Continue

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;