const {
  Client,
  GatewayIntentBits,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const QuizController = require('./controllers/QuizController');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const commandModules = require(path.join(commandsPath, file));

  if (Array.isArray(commandModules)) {
    for (const command of commandModules) {
      if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
      } else {
        console.error(`❌ ${file}에 명령어 'data' 속성이 누락되었습니다.`);
      }
    }
  } else {
    if (commandModules.data && commandModules.data.name) {
      client.commands.set(commandModules.data.name, commandModules);
    } else {
      console.error(`❌ ${file}에 명령어 'data' 속성이 누락되었습니다.`);
    }
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: '❌ 알 수 없는 명령어입니다.',
        ephemeral: true,
      });

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ 명령어 실행 중 오류 발생:', error);
      await interaction.reply({
        content: '⚠️ 명령어 실행 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'select_years') {
      await interaction.deferUpdate();

      const selectedYears = interaction.values;
      const startButton = new ButtonBuilder()
        .setCustomId('start_quiz')
        .setLabel('게임 시작 🎵')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      const buttonRow = new ActionRowBuilder().addComponents(startButton);

      await interaction.editReply({
        content: `✅ 선택된 연도: ${selectedYears.join(
          ', '
        )}년\n"게임 시작"을 눌러주세요!`,
        components: [buttonRow],
      });

      await QuizController.handleYearSelection(interaction, selectedYears);
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'start_quiz') {
      await interaction.deferUpdate();
      await QuizController.startQuiz(interaction);
    }
  }
});

client.login(process.env.TOKEN);
