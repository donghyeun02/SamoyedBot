module.exports = {
  alreadyRunning(interaction) {
    interaction.reply({
      content: '❌ 이미 퀴즈가 진행 중입니다!',
      ephemeral: true,
    });
  },

  async startQuiz(interaction, song, connection) {
    const player = createAudioPlayer();
    connection.subscribe(player);

    // 🎵 yt-dlp를 이용해 음성 채널에서 노래 재생
    const ytDlpProcess = spawn('yt-dlp', [
      '--no-playlist',
      '--quiet',
      '-f',
      'bestaudio',
      '-o',
      '-',
      song.url,
    ]);

    const resource = createAudioResource(ytDlpProcess.stdout);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      ytDlpProcess.kill();
    });

    await interaction.editReply({
      content: `🎵 노래가 재생 중입니다. 제목을 맞춰보세요!`,
      components: [],
    });
  },

  async showResult(interaction, correctTitle, guess, isCorrect) {
    if (isCorrect) {
      await interaction.followUp(
        `✅ 정답입니다! 🎉: **${correctTitle}**\n+1점이 추가되었습니다!`
      );
    } else {
      await interaction.followUp(
        `❌ 오답입니다. 정답은 **${correctTitle}**입니다.`
      );
    }
  },

  async showScores(interaction, scores) {
    if (!scores || Object.keys(scores).length === 0) {
      return interaction.reply({
        content: '📊 현재 점수가 없습니다.',
        ephemeral: true,
      });
    }

    let leaderboard = Object.values(scores)
      .sort((a, b) => b.points - a.points)
      .map(
        (entry, index) => `**${index + 1}. ${entry.name}** - ${entry.points}점`
      )
      .join('\n');

    await interaction.followUp(`📊 **현재 순위:**\n${leaderboard}`);
  },
};
