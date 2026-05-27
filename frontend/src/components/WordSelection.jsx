import socket
from "../socket/socket";

function WordSelection({
  word,
  wordChoices,
  roomId
}) {

  // CHOOSE WORD
  const chooseWord =
    (selectedWord) => {

      socket.emit(
        "selectWord",
        {
          roomId,
          word: selectedWord
        }
      );

    };

  // WORD CHOICES
  if (
    wordChoices &&
    wordChoices.length > 0
  ) {

    return (

      <div>

        <h2 className="text-xl font-bold mb-4">

          Choose a Word

        </h2>

        <div className="grid gap-3">

          {
            wordChoices.map(
              (item) => (

                <button
                  key={item}
                  className="btn btn-primary btn-lg rounded-2xl"
                  onClick={() =>
                    chooseWord(item)
                  }
                >

                  {item}

                </button>

              )
            )
          }

        </div>

      </div>

    );

  }

  // DRAWER WORD
  if (word) {

    return (

      <div>

        <h2 className="font-bold text-lg">

          Your Word:

        </h2>

        <div className="text-3xl font-black text-primary mt-2">

          {word}

        </div>

      </div>

    );

  }

  return (

    <div className="opacity-60">

      Waiting for word...

    </div>

  );

}

export default WordSelection;