module.exports = {
  alreadyRunning(interaction) {
    interaction.reply('❌ 이미 퀴즈가 진행 중입니다!');
  },
  start(interaction, url) {
    interaction.reply(`🎶 퀴즈 시작! 아래 노래를 들어보세요: ${url}`);
  },
  timeUp(interaction, title) {
    interaction.reply(`⏰ 시간이 초과되었습니다! 정답은 **${title}** 입니다.`);
  },
  correct(interaction, title) {
    interaction.reply(`🎉 정답입니다! **${title}**`);
  },
  incorrect(interaction) {
    interaction.reply('❌ 틀렸습니다! 다시 시도해보세요.');
  },
  noQuizRunning(interaction) {
    interaction.reply('❌ 현재 진행 중인 퀴즈가 없습니다.');
  },
};
