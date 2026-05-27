import { useState } from "react";

function CreateRoomModal({
  open,
  onClose,
  onCreate
}) {

  const [settings, setSettings] =
    useState({

      maxRounds: 5,

      maxPlayers: 8,

      drawTime: 60,

      difficulty: "easy",

      customWords: ""

    });

  if (!open) return null;

  const handleChange = (
    key,
    value
  ) => {

    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));

  };

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-base-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-base-300">

        <h2 className="text-3xl font-black mb-6">

          Create Private Room

        </h2>

        <div className="space-y-5">

          {/* ROUNDS */}
          <div>

            <label className="font-semibold">

              Rounds

            </label>

            <input
              type="number"
              min={1}
              max={10}
              value={
                settings.maxRounds
              }
              onChange={(e) =>
                handleChange(
                  "maxRounds",
                  Number(
                    e.target.value
                  )
                )
              }
              className="input input-bordered w-full mt-2"
            />

          </div>

          {/* PLAYERS */}
          <div>

            <label className="font-semibold">

              Max Players

            </label>

            <input
              type="number"
              min={2}
              max={12}
              value={
                settings.maxPlayers
              }
              onChange={(e) =>
                handleChange(
                  "maxPlayers",
                  Number(
                    e.target.value
                  )
                )
              }
              className="input input-bordered w-full mt-2"
            />

          </div>

          {/* TIMER */}
          <div>

            <label className="font-semibold">

              Draw Timer (sec)

            </label>

            <input
              type="number"
              min={30}
              max={180}
              value={
                settings.drawTime
              }
              onChange={(e) =>
                handleChange(
                  "drawTime",
                  Number(
                    e.target.value
                  )
                )
              }
              className="input input-bordered w-full mt-2"
            />

          </div>

          {/* DIFFICULTY */}
          <div>

            <label className="font-semibold">

              Difficulty

            </label>

            <select
              value={
                settings.difficulty
              }
              onChange={(e) =>
                handleChange(
                  "difficulty",
                  e.target.value
                )
              }
              className="select select-bordered w-full mt-2"
            >

              <option value="easy">
                Easy
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="hard">
                Hard
              </option>

            </select>

          </div>

          {/* CUSTOM WORDS */}
          <div>

            <label className="font-semibold">

              Custom Words
            </label>

            <textarea
              placeholder="apple, banana, tiger"
              value={
                settings.customWords
              }
              onChange={(e) =>
                handleChange(
                  "customWords",
                  e.target.value
                )
              }
              className="textarea textarea-bordered w-full mt-2"
            />

          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="btn btn-ghost"
          >

            Cancel

          </button>

          <button
            onClick={() =>
              onCreate(settings)
            }
            className="btn btn-primary"
          >

            Create Room

          </button>

        </div>

      </div>

    </div>

  );

}

export default CreateRoomModal;