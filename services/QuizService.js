const fs = require('fs');
const path = require('path');

const songsFilePath = path.join(__dirname, '../data/songs.json');
let currentQuiz = {};

function loadSongs() {
  try {
    const data = fs.readFileSync(songsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 노래 데이터를 불러오는 중 오류 발생:', error);
    return {};
  }
}

function getSongsByYearRange(yearRange) {
  const songDB = loadSongs();
  const songs = [];

  if (yearRange.includes('-')) {
    const [startYear, endYear] = yearRange.split('-').map(Number);
    for (let year = startYear; year <= endYear; year++) {
      if (songDB[year]) {
        songs.push(...songDB[year]);
      }
    }
  } else {
    const year = Number(yearRange);
    if (songDB[year]) {
      songs.push(...songDB[year]);
    }
  }

  return songs.length > 0 ? songs : null;
}

module.exports = {
  currentQuiz,

  async getRandomSong(yearRange, guildId) {
    const songs = getSongsByYearRange(yearRange);
    if (!songs) {
      throw new Error('❌ 해당 연도 범위에 대한 노래 데이터가 없습니다.');
    }

    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    currentQuiz[guildId] = randomSong;
    return randomSong;
  },

  async checkAnswer(interaction, guess, guildId) {
    if (!currentQuiz[guildId]) {
      return { correct: false, correctTitle: null };
    }

    const correctTitle = currentQuiz[guildId].title;
    if (guess.toLowerCase() === correctTitle.toLowerCase()) {
      delete currentQuiz[guildId];
      return { correct: true, correctTitle };
    }

    return { correct: false, correctTitle };
  },
};
