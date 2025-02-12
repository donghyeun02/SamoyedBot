const QuizService = require('../services/QuizService');
const QuizView = require('../views/QuizView');

module.exports = {
  async handleYearSelection(interaction, selectedYears) {
    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ 음성 채널에 들어가 있어야 퀴즈를 시작할 수 있습니다.',
        ephemeral: true,
      });
    }

    try {
      const song = await QuizService.getRandomSong(
        selectedYears,
        guildId,
        voiceChannel
      );
      if (!song) {
        return interaction.update({
          content: '❌ 해당 연도의 노래 데이터가 없습니다.',
          components: [],
        });
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
      interaction.reply({
        content: '⚠️ 퀴즈를 시작하는 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },

  async checkAnswer(interaction) {
    const guess = interaction.options.getString('정답').toLowerCase();
    const guildId = interaction.guild.id;
    const result = await QuizService.checkAnswer(interaction, guess, guildId);

    if (result.message) {
      return interaction.reply({ content: result.message, ephemeral: true });
    }

    await QuizView.showResult(
      interaction,
      result.correctTitle,
      guess,
      result.correct
    );
  },

  async showScores(interaction) {
    const guildId = interaction.guild.id;
    const scores = await QuizService.getScores(guildId);

    await QuizView.showScores(interaction, scores);
  },
};
