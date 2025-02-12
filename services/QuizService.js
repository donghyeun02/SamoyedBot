const fs = require('fs');
const path = require('path');

const songsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/songs.json'), 'utf8')
);

let scores = {};
let currentQuiz = {};
let quizParticipants = {};

const scoreFilePath = path.join(__dirname, '../data/scores.json');

function saveScores() {
  fs.writeFileSync(scoreFilePath, JSON.stringify(scores, null, 2));
}

if (fs.existsSync(scoreFilePath)) {
  scores = JSON.parse(fs.readFileSync(scoreFilePath, 'utf8'));
}

module.exports = {
  async getRandomSong(selectedYears, guildId, voiceChannel) {
    let allSongs = [];

    selectedYears.forEach((year) => {
      if (songsData[year]) {
        allSongs = allSongs.concat(songsData[year]);
      }
    });

    if (allSongs.length === 0) return null;

    const randomSong = allSongs[Math.floor(Math.random() * allSongs.length)];
    currentQuiz[guildId] = randomSong;

    quizParticipants[guildId] = voiceChannel.members.map(
      (member) => member.user.id
    );

    return randomSong;
  },

  async checkAnswer(interaction, guess, guildId) {
    if (!currentQuiz[guildId]) {
      return { correct: false, correctTitle: null };
    }

    const correctTitle = currentQuiz[guildId].title.toLowerCase();
    const userId = interaction.user.id;
    const userName = interaction.user.username;

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return {
        correct: false,
        correctTitle,
        message: '❌ 음성 채널에 있어야 정답을 맞힐 수 있습니다!',
      };
    }

    if (
      !quizParticipants[guildId] ||
      !quizParticipants[guildId].includes(userId)
    ) {
      return {
        correct: false,
        correctTitle,
        message: '❌ 퀴즈 시작 당시 참가자만 정답을 입력할 수 있습니다!',
      };
    }

    if (guess.toLowerCase() === correctTitle) {
      if (!scores[guildId]) scores[guildId] = {};
      if (!scores[guildId][userId])
        scores[guildId][userId] = { name: userName, points: 0 };

      scores[guildId][userId].points += 1;
      saveScores();

      delete currentQuiz[guildId];
      delete quizParticipants[guildId];

      return { correct: true, correctTitle };
    }

    return { correct: false, correctTitle };
  },

  async getScores(guildId) {
    if (!scores[guildId]) return {};
    return scores[guildId];
  },
};
