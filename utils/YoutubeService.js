const axios = require('axios');

module.exports = {
  async search(query) {
    try {
      const API_KEY = process.env.YOUTUBE_API_KEY;
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 1,
            key: API_KEY,
          },
        }
      );

      if (response.data.items.length === 0) return null;

      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.high.url,
      };
    } catch (error) {
      console.error('❌   유튜브 검색 오류:', error);
      return null;
    }
  },
};
