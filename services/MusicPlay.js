const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
} = require('@discordjs/voice');

const { spawn } = require('child_process');
require('dotenv').config();

const Queue = require('../models/Queue');
const MusicView = require('../views/MusicView');
const YouTubeService = require('../utils/YoutubeService');

const ytDlpPath = process.env.YT_DLP_PATH || 'yt-dlp';

module.exports = {
  async playSong(connection, song, interaction) {
    const requester = interaction.user.username;
    const requesterAvatar = interaction.user.displayAvatarURL({
      dynamic: true,
    });

    const process = spawn(
      ytDlpPath,
      [
        '-f',
        'bestaudio',
        '--no-playlist',
        '--quiet',
        '--print-json',
        '-o',
        '-',
        song.url,
      ],
      { stdio: ['ignore', 'pipe', 'ignore'] }
    );

    const resource = createAudioResource(process.stdout);

    if (connection) {
      connection.player.play(resource);
      interaction.followUp({
        embeds: [MusicView.nowPlaying(song, requester, requesterAvatar)],
      });
    } else {
      interaction.followUp(':x: 오류: 음성 채널에 연결할 수 없습니다.');
    }
  },

  async handlePlay(interaction, query) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return interaction.followUp(':x: 음성 채널에 먼저 들어가주세요!');

    try {
      const song = await YouTubeService.search(query);
      if (!song)
        return interaction.followUp(':x: 해당 노래를 찾을 수 없습니다.');

      const guildId = interaction.guild.id;
      Queue.addSong(guildId, song);

      let connection = getVoiceConnection(guildId);
      if (!connection) {
        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }

      if (!connection.player) {
        const player = createAudioPlayer();
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
          const nextSong = Queue.skipSong(guildId);
          if (nextSong) {
            this.playSong(connection, nextSong, interaction);
          } else {
            Queue.clearQueue(guildId, connection);
          }
        });

        connection.player = player;
      }

      if (Queue.getQueueList(guildId).length === 1) {
        this.playSong(connection, song, interaction);
      } else {
        interaction.followUp(
          `🎵 **${song.title}**이(가) 대기열에 추가되었습니다.`
        );
      }
    } catch (error) {
      console.error(':x: 음악 재생 오류:', error);
      interaction.followUp(':x: 노래를 재생하는 중 오류가 발생했습니다.');
    }
  },
};
