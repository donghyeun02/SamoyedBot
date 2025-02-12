const QuizService = require('../services/QuizService');
const QuizView = require('../views/QuizView');
const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const { spawn } = require('child_process');
const fs = require('fs');
require('dotenv').config();

const ytDlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
const cookiesPath = process.env.COOKIES_PATH;

let currentProcess = null;

module.exports = {
  async handleYearSelection(interaction, selectedYears) {
    await interaction.deferUpdate();

    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.followUp({
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
      const song = await QuizService.getRandomSong(
        selectedYears,
        guildId,
        voiceChannel
      );
      if (!song) {
        return interaction.editReply({
          content: '❌ 해당 연도의 노래 데이터가 없습니다.',
          components: [],
        });
      }

      await this.playSong(connection, song, interaction);

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
      interaction.followUp({
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
    } else {
      console.warn(
        '⚠️ Warning: `cookies.txt` 파일이 없습니다. 로그인된 영상은 재생할 수 없습니다.'
      );
    }

    const ytDlpProcess = spawn(ytDlpPath, ytDlpArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    currentProcess = ytDlpProcess;

    ytDlpProcess.stderr.on('data', (data) => {
      console.error(`yt-dlp error: ${data.toString()}`);
    });

    ytDlpProcess.on('error', (error) => {
      console.error('❌ yt-dlp 실행 오류:', error);
      interaction.followUp(':x: yt-dlp 실행 중 오류가 발생했습니다.');
    });

    ytDlpProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ yt-dlp 프로세스가 정상적으로 종료되었습니다.');
      } else {
        console.log(`⚠️ yt-dlp 프로세스가 종료됨 (코드: ${code})`);
      }
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

    await interaction.followUp({
      content: '🎵 노래가 재생됩니다. 제목을 맞춰보세요!',
      ephemeral: true,
    });
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
