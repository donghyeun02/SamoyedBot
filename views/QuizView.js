module.exports = {
  alreadyRunning(interaction) {
    interaction.reply('❌ 이미 퀴즈가 진행 중입니다!');
  },

  startQuiz(interaction, song) {
    interaction.reply(`🎶 퀴즈 시작! 아래 노래를 들어보세요: ${song.url}`);
  },

  async showResult(interaction, correctTitle, guess, isCorrect) {
    if (isCorrect) {
      interaction.reply(
        `✅ 정답입니다! 🎉: **${correctTitle}**\n+1점이 추가되었습니다!`
      );
    } else {
      interaction.reply(`❌ 오답입니다. 정답은 **${correctTitle}**입니다.`);
    }
  },

  async showScores(interaction, scores) {
    if (!scores || Object.keys(scores).length === 0) {
      return interaction.reply('📊 현재 점수가 없습니다.');
    }

    let leaderboard = Object.values(scores)
      .sort((a, b) => b.points - a.points)
      .map(
        (entry, index) => `**${index + 1}. ${entry.name}** - ${entry.points}점`
      )
      .join('\n');

    interaction.reply(`📊 **현재 순위:**\n${leaderboard}`);
  },
};
