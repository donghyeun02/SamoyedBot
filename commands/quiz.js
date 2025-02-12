const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const songsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/songs.json'), 'utf8')
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈')
    .setDescription('노래 맞추기 퀴즈를 시작합니다.'),

  async execute(interaction) {
    const years = Object.keys(songsData);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_years')
      .setPlaceholder('연도를 선택하세요 (최대 2개)')
      .setMinValues(1)
      .setMaxValues(2)
      .addOptions(
        years.map((year) => ({
          label: `${year}년`,
          value: year,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const startButton = new ButtonBuilder()
      .setCustomId('start_quiz')
      .setLabel('게임 시작 🎵')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const buttonRow = new ActionRowBuilder().addComponents(startButton);

    await interaction.reply({
      content: '🎵 연도를 선택한 후 "게임 시작"을 눌러주세요!',
      components: [row, buttonRow],
      flags: MessageFlags.Ephemeral,
    });
  },
};
