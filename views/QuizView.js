const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  async showStartMenu(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('yearSelect')
        .setPlaceholder('연도를 선택하세요')
        .addOptions(
          { label: '2015', value: '2015' },
          { label: '2016', value: '2016' },
          { label: '2017', value: '2017' },
          { label: '2015-2017', value: '2015-2017' }
        )
    );

    const startRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('startGame')
        .setLabel('게임 시작')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: '🎵 연도를 선택한 후 "게임 시작"을 눌러주세요!',
      components: [row, startRow],
    });
  },

  async startQuiz(interaction, song) {
    const embed = new EmbedBuilder()
      .setTitle('🎵 노래 퀴즈!')
      .setDescription('아래 링크에서 노래를 듣고 제목을 맞춰보세요!')
      .addFields({ name: '노래 링크', value: song.url })
      .setFooter({ text: '제한 시간: 60초' });

    await interaction.update({ content: '', embeds: [embed], components: [] });
  },

  async showResult(interaction, correctTitle, userGuess) {
    const resultText =
      userGuess.toLowerCase() === correctTitle.toLowerCase()
        ? `✅ 정답입니다! 🎉: **${correctTitle}**`
        : `❌ 오답입니다. 정답은 **${correctTitle}**입니다.`;

    await interaction.followUp(resultText);
  },
};
