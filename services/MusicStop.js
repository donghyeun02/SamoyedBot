const { getVoiceConnection } = require('@discordjs/voice');
const Queue = require('../models/Queue');
const MusicView = require('../views/MusicView');

module.exports = {
  async stopMusic(interaction) {
    try {
      await interaction.deferReply();

      const guildId = interaction.guild.id;
      const connection = getVoiceConnection(guildId);

      if (!connection) {
        return interaction.followUp(
          ':x:   오류: 현재 음성 채널에 연결되어 있지 않습니다.'
        );
      }

      connection.destroy();
      Queue.clearQueue(guildId);

      await interaction.followUp({ embeds: [MusicView.stopMessage()] });
    } catch (error) {
      console.error(':x:   /종료 실행 중 오류 발생:', error);
      if (!interaction.replied) {
        await interaction.followUp(' 오류 발생: 음악을 중지할 수 없습니다.');
      }
    }
  },
};
