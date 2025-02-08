const Queue = require('../models/Queue'); // 여기에 Queue를 불러옵니다.
const MusicView = require('../views/MusicView');

module.exports = {
  async showQueue(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const queue = Queue.getQueueList(guildId);

    if (queue.length === 0) {
      interaction.followUp('📜   대기 중인 곡이 없습니다.');
    } else {
      interaction.followUp({ embeds: [MusicView.queueList(queue)] });
    }
  },
};
