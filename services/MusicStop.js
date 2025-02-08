const { getVoiceConnection } = require('@discordjs/voice');
const Queue = require('../models/Queue');
const MusicView = require('../views/MusicView');

module.exports = {
  async stopMusic(interaction) {
    // await interaction.deferReply();
    const guildId = interaction.guild.id;

    getVoiceConnection(guildId)?.destroy();
    Queue.clearQueue(guildId);

    interaction.followUp({ embeds: [MusicView.stopMessage()] });
  },
};
