const words =
require("../utils/words");

// GET 3 RANDOM WORDS
function getWordChoices() {

  const shuffled =
    [...words].sort(
      () => 0.5 - Math.random()
    );

  return shuffled.slice(0, 3);

}

module.exports = {
  getWordChoices
};
