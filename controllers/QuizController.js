const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { spawn } = require('child_process');
const fs = require('fs');
require('dotenv').config();

const ytDlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
const cookiesPath = process.env.COOKIES_PATH;

let currentProcess = null;
let selectedYearsMap = {};
let quizParticipants = {};

module.exports = {
  async handleYearSelection(interaction, selectedYears) {
    await interaction.update({
      content: `✅ 선택된 연도: ${selectedYears.join(
        ', '
      )}년\n"게임 시작"을 눌러주세요!`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('start_quiz')
            .setLabel('게임 시작 🎵')
            .setStyle(ButtonStyle.Primary)
        ),
      ],
      ephemeral: true,
    });

    selectedYearsMap[interaction.user.id] = selectedYears;
  },

  async handleGameStart(interaction) {
    const userId = interaction.user.id;
    if (!selectedYearsMap[userId]) {
      return interaction.reply({
        content: '❌ 먼저 연도를 선택해주세요!',
        ephemeral: true,
      });
    }

    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ 음성 채널에 들어가 있어야 퀴즈를 시작할 수 있습니다.',
        ephemeral: true,
      });
    }

    let connection = getVoiceConnection(guildId);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
    }

    try {
      const selectedYears = selectedYearsMap[userId];
      const song = await QuizService.getRandomSong(
        selectedYears,
        guildId,
        voiceChannel
      );
      if (!song) {
        return interaction.reply({
          content: '❌ 해당 연도의 노래 데이터가 없습니다.',
          ephemeral: true,
        });
      }

      quizParticipants[guildId] = Array.from(voiceChannel.members.keys());

      await this.playSong(connection, song, interaction);

      const answerButton = new ButtonBuilder()
        .setCustomId('submit_answer')
        .setLabel('정답 입력 ✏️')
        .setStyle(ButtonStyle.Success);

      await interaction.followUp({
        content: '🎵 노래가 재생됩니다. 제목을 맞춰보세요!',
        components: [new ActionRowBuilder().addComponents(answerButton)],
        ephemeral: false,
      });

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

  async playSong(connection, song, interaction) {
    if (currentProcess) {
      console.log('⏹️ 이전 yt-dlp 프로세스를 종료합니다.');
      currentProcess.kill();
      currentProcess = null;
    }

    const ytDlpArgs = [
      '--force-ipv4',
      '-f',
      'bestaudio',
      '--no-playlist',
      '--quiet',
      '-o',
      '-',
      song.url,
    ];

    if (cookiesPath && fs.existsSync(cookiesPath)) {
      ytDlpArgs.push('--cookies', cookiesPath);
    }

    const ytDlpProcess = spawn(ytDlpPath, ytDlpArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    currentProcess = ytDlpProcess;

    ytDlpProcess.on('close', (code) => {
      if (code !== 0)
        console.log(`⚠️ yt-dlp 프로세스가 종료됨 (코드: ${code})`);
      currentProcess = null;
    });

    const resource = createAudioResource(ytDlpProcess.stdout);
    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('🎵 노래 재생이 끝났습니다.');
      currentProcess = null;
    });
  },

  async showAnswerModal(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('answer_modal')
      .setTitle('정답 입력');

    const answerInput = new TextInputBuilder()
      .setCustomId('answer_text')
      .setLabel('노래 제목을 입력하세요')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(answerInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },

  async checkAnswer(interaction) {
    const guess = interaction.fields
      .getTextInputValue('answer_text')
      .toLowerCase();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (!quizParticipants[guildId]?.includes(userId)) {
      return interaction.reply({
        content:
          '❌ 퀴즈 시작 당시 음성 채널에 있었던 사람만 정답을 입력할 수 있습니다!',
        ephemeral: true,
      });
    }

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
};
