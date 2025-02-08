const { getVoiceConnection } = require('@discordjs/voice');
const Queue = require('../models/Queue');
const MusicPlay = require('./MusicPlay');

module.exports = {
  async skipSong(interaction) {
    try {
      await interaction.deferReply();

      const guildId = interaction.guild.id;
      const queue = Queue.getQueueList(guildId);

      if (queue.length <= 1) {
        Queue.clearQueue(guildId);
        getVoiceConnection(guildId)?.destroy();
        return interaction.followUp(
          '⏹️   대기열이 비어있어 음악을 종료합니다.'
        );
      }

      const nextSong = Queue.skipSong(guildId);
      const connection = getVoiceConnection(guildId);

      if (!connection) {
        return interaction.followUp(
          ':x:   오류: 봇이 음성 채널에 연결되어 있지 않습니다.'
        );
      }

      if (!nextSong) {
        return interaction.followUp('⏹️   더 이상 대기 중인 곡이 없습니다.');
      }

      MusicPlay.playSong(connection, nextSong, interaction);
      return interaction.followUp(`⏩ **${nextSong.title}**(이)가 재생됩니다.`);
    } catch (error) {
      console.error(':x:   /스킵 실행 중 오류 발생:', error);
      if (!interaction.replied) {
        await interaction.followUp(
          ':x:   오류 발생: 노래를 스킵할 수 없습니다.'
        );
      }
    }
  },
};
