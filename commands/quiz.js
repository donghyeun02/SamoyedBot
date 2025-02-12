const { SlashCommandBuilder } = require('discord.js');
const QuizController = require('../controllers/QuizController');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈')
    .setDescription('노래 맞추기 퀴즈를 시작합니다.'),
  async execute(interaction) {
    await QuizController.showStartMenu(interaction);
  },
};
