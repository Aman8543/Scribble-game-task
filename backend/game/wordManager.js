const words =
require("../utils/words");

// GET 3 RANDOM WORDS
function getWordChoices(room) {

  let availableWords = [];

  // CUSTOM WORDS
  if (
    room.settings.customWords
      .length > 0
  ) {

    availableWords =
      room.settings.customWords;

  } else {

    availableWords = words;

  }

  return [...availableWords]

    .sort(() => 0.5 - Math.random())

    .slice(0, 3);

}
module.exports = {
  getWordChoices
};
