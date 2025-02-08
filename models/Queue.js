class MusicQueue {
  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, []);
    }
    return this.queues.get(guildId);
  }

  addSong(guildId, song) {
    const queue = this.getQueue(guildId);
    queue.push(song);
  }

  getCurrentSong(guildId) {
    const queue = this.getQueue(guildId);
    return queue.length > 0 ? queue[0] : null;
  }

  skipSong(guildId) {
    const queue = this.getQueue(guildId);
    queue.shift();
    return queue.length > 0 ? queue[0] : null;
  }

  getQueueList(guildId) {
    return this.getQueue(guildId);
  }

  clearQueue(guildId, connection) {
    this.queues.set(guildId, []);
    if (connection) connection.destroy();
  }
}

module.exports = new MusicQueue();
