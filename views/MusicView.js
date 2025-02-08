const { EmbedBuilder } = require('discord.js');

module.exports = {
  nowPlaying(song, requester, requesterAvatar) {
    // ✅ 신청자 아이콘 추가
    return new EmbedBuilder()
      .setTitle(`🎵   재생 중: ${song.title}`)
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .setColor('#00FF00')
      .setFooter({
        text: `신청한 사람: ${requester}`,
        iconURL: requesterAvatar,
      });
  },

  queueList(queue) {
    if (queue.length === 0) {
      return new EmbedBuilder()
        .setTitle(':x:   대기 중인 노래 없음')
        .setColor('#FF0000');
    }

    const description = queue
      .map((song, index) => `**${index + 1}.** [${song.title}](${song.url})`)
      .join('\n');

    return new EmbedBuilder()
      .setTitle('📜   대기 중인 노래')
      .setDescription(description)
      .setColor('#00FF00');
  },

  stopMessage() {
    return new EmbedBuilder()
      .setTitle(':x:   음악을 종료했습니다.')
      .setColor('#FF0000');
  },
};
