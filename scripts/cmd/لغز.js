const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "لغز",
    version: "1.4",
    author: "Shikaki",
    role: 0,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "لعبة فردية",
    shortDescription: { ar: "احصل على لغز وحاول حله للفوز" },
    longDescription: { ar: "احصل على لغز من الملف وحاول تجاوب عليه للفوز بالجائزة" },
    guide: { ar: "{prefix}لغز" }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    if (Reply.type !== "reply") return;

    const userAnswer = event.body.trim().toLowerCase();
    const correctAnswer = Reply.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);
      global.GoatBot.onReply.delete(Reply.messageID);
      return api.sendMessage(
        `▸ ◉ مبروك!  
│ الإجابة صحيحة  
▸ ◉ لقد فزت بـ ${reward} دولار 💰`, 
        event.threadID
      );
    } else {
      return api.sendMessage(
        `▸ ◉ إجابة خاطئة  
│ حاول مرة أخرى`, 
        event.threadID
      );
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID } = event;
    const filePath = path.join(__dirname, 'Offices', 'riddles.json');
    const riddles = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
    const { riddle, answer } = randomRiddle;

    const startMsg =
`▸ ◉ لغز جديد!  
│ حاول تجاوب على اللغز التالي  
▸ ◉ اللغز: "${riddle}"`;

    api.sendMessage({ body: startMsg }, threadID, async (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        type: "reply",
        commandName: "لغز",
        messageID: info.messageID,
        answer
      });
    });
  }
};