const QuizView = require('../views/QuizView');
const YouTubeService = require('../utils/YoutubeService');
let currentQuiz = null;

module.exports = {
  async start(interaction) {
    if (currentQuiz) {
      return QuizView.alreadyRunning(interaction);
    }

    const song = await YouTubeService.getRandomSong();
    currentQuiz = { title: song.title, url: song.url };

    await QuizView.start(interaction, song.url);

    setTimeout(() => {
      if (currentQuiz) {
        QuizView.timeUp(interaction, currentQuiz.title);
        currentQuiz = null;
      }
    }, 30000); // 30초 제한
  },

  async guess(interaction) {
    const guess = interaction.options.getString('정답');
    if (!currentQuiz) {
      return QuizView.noQuizRunning(interaction);
    }

    if (guess.toLowerCase() === currentQuiz.title.toLowerCase()) {
      QuizView.correct(interaction, currentQuiz.title);
      currentQuiz = null;
    } else {
      QuizView.incorrect(interaction);
    }
  },
};
