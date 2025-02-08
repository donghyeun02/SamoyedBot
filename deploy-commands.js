const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const commands = [];
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const commandModule = require(`./commands/${file}`);

  // ✅ commandModule이 배열인지 확인 후 처리
  if (Array.isArray(commandModule)) {
    for (const command of commandModule) {
      if (command.data) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`⚠️ ${file} 명령어 파일에 data 속성이 없습니다.`);
      }
    }
  } else {
    // 단일 명령어일 경우 처리
    if (commandModule.data) {
      commands.push(commandModule.data.toJSON());
    } else {
      console.warn(`⚠️ ${file} 명령어 파일에 data 속성이 없습니다.`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('⏳ 명령어를 등록 중입니다...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log('✅ 명령어가 성공적으로 등록되었습니다!');
  } catch (error) {
    console.error(error);
  }
})();
