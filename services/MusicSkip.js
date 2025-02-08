const Queue = require('../models/Queue');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  async skipSong(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guild.id;
    const queue = Queue.getQueueList(guildId);

    if (queue.length <= 1) {
      Queue.clearQueue(guildId);
      interaction.followUp(':x:   대기열이 비어있어 음악을 종료합니다.');
      getVoiceConnection(guildId)?.destroy();
      return;
    }

    const nextSong = Queue.skipSong(guildId);
    const connection = getVoiceConnection(guildId);

    if (!connection) {
      interaction.followUp(
        ':x:   오류: 봇이 음성 채널에 연결되어 있지 않습니다.'
      );
      return;
    }

    if (!nextSong) {
      interaction.followUp(':x:   오류: 다음 노래를 찾을 수 없습니다.');
      return;
    }

    interaction.followUp(`🎵   **${nextSong.title}**(이)가 재생됩니다.`);

    require('./MusicPlay').playSong(interaction, nextSong);
  },
};
