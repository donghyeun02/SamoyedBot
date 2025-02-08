const musicPlay = require('../services/MusicPlay');
const musicSkip = require('../services/MusicSkip');
const musicList = require('../services/MusicList');
const musicStop = require('../services/MusicStop');

module.exports = {
  async play(interaction) {
    const query = interaction.options.getString('노래');
    if (!query) return interaction.followUp('❌ 노래 제목을 입력해주세요!');

    await interaction.deferReply();

    await musicPlay.handlePlay(interaction, query);
  },

  async skip(interaction) {
    await musicSkip.skipSong(interaction);
  },

  async list(interaction) {
    await musicList.showQueue(interaction);
  },

  async stop(interaction) {
    await musicStop.stopMusic(interaction);
  },
};
