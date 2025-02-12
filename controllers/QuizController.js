const QuizService = require('../services/QuizService');
const QuizView = require('../views/QuizView');

module.exports = {
  async showStartMenu(interaction) {
    await QuizView.showStartMenu(interaction);
  },

  async handleYearSelection(interaction, yearRange) {
    const guildId = interaction.guild.id;
    try {
      const song = await QuizService.getRandomSong(yearRange, guildId);
      if (!song) {
        return interaction.update('❌ 해당 연도의 노래 데이터가 없습니다.');
      }

      await QuizView.startQuiz(interaction, song);

      setTimeout(async () => {
        if (QuizService.currentQuiz[guildId]) {
          await interaction.followUp(
            `⏰ 시간이 초과되었습니다! 정답은 **${song.title}** 입니다.`
          );
          delete QuizService.currentQuiz[guildId];
        }
      }, 60000);
    } catch (error) {
      console.error('❌ 퀴즈 시작 중 오류:', error);
      interaction.reply('⚠️ 퀴즈를 시작하는 중 오류가 발생했습니다.');
    }
  },

  async checkAnswer(interaction) {
    const guess = interaction.options.getString('정답').toLowerCase();
    const guildId = interaction.guild.id;
    const result = await QuizService.checkAnswer(interaction, guess, guildId);
    await QuizView.showResult(interaction, result.correctTitle, guess);
  },
};
