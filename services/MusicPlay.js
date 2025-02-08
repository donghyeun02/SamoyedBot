const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
} = require('@discordjs/voice');

const { spawn } = require('child_process');
const fs = require('fs');
const { createAudioResource } = require('@discordjs/voice');
require('dotenv').config();

const YT_DLP_PATH = process.env.YT_DLP_PATH || '/usr/local/bin/yt-dlp';
const COOKIES_PATH =
  process.env.COOKIES_PATH || '/home/ubuntu/SamoyedBot/services/cookies.txt';

async function playSong(connection, song, interaction) {
  try {
    const ytDlpArgs = ['-f', 'bestaudio', '--no-playlist', '-o', '-', song.url];

    if (COOKIES_PATH && fs.existsSync(COOKIES_PATH)) {
      ytDlpArgs.push('--cookies', COOKIES_PATH);
    } else {
      console.warn(
        '⚠️ Warning: `cookies.txt` 파일이 없습니다. 로그인된 영상은 재생할 수 없습니다.'
      );
    }

    console.log(`🎵 Running yt-dlp: ${YT_DLP_PATH} ${ytDlpArgs.join(' ')}`);

    const ytDlpProcess = spawn(YT_DLP_PATH, ytDlpArgs);

    ytDlpProcess.stderr.on('data', (data) => {
      console.error(`yt-dlp error: ${data.toString()}`);
    });

    ytDlpProcess.on('error', (error) => {
      console.error(`❌ yt-dlp spawn error: ${error.message}`);
    });

    ytDlpProcess.on('close', (code) => {
      console.log(`yt-dlp process exited with code ${code}`);
    });

    const resource = createAudioResource(ytDlpProcess.stdout);
    connection.player.play(resource);

    interaction.followUp(`🎵 Now playing: **${song.title}**`);
  } catch (error) {
    console.error(`❌ Error playing song: ${error.message}`);
    interaction.followUp('❌ 노래를 재생하는 중 오류가 발생했습니다.');
  }
}

module.exports = { playSong };
