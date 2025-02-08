const { SlashCommandBuilder } = require('@discordjs/builders');
const MusicController = require('../controllers/MusicController');

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName('재생')
      .setDescription('노래를 재생')
      .addStringOption((option) =>
        option
          .setName('노래')
          .setDescription('재생할 노래 제목')
          .setRequired(true)
      ),
    async execute(interaction) {
      return MusicController.play(interaction);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('스킵')
      .setDescription('현재 노래 스킵'),
    async execute(interaction) {
      return MusicController.skip(interaction);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('리스트')
      .setDescription('대기 중인 노래 리스트 표시'),
    async execute(interaction) {
      return MusicController.list(interaction);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('종료')
      .setDescription('음악 중지 및 봇 퇴장'),
    async execute(interaction) {
      return MusicController.stop(interaction);
    },
  },
];
