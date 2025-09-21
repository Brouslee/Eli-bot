const fs = require('fs');

module.exports = {
  config: {
    name: "ايموجي",
    version: "1.2",
    author: "حسين يعقوبي + gpt",
    role: 0,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "لعبة فردية",
    shortDescription: { ar: "▸ قم بإرسال الإيموجي حسب الوصف 💬" },
    longDescription: { ar: "▸ سيُعطى لك وصف لإيموجي ويجب أن ترسله بشكل صحيح للفوز بالجائزة 🎯" },
    guide: { ar: "{prefix}إيموجي - ابدأ اللعبة وأرسل الإيموجي الصحيح حسب الوصف" }
  },

  onStart: async function ({ message, event, commandName }) {
    const questions = JSON.parse(fs.readFileSync('emojie.json'));
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    const startMsg = 
`▸ ◉ لعبة الإيموجي بدأت!  
│ الوصف: "${randomQuestion.question}"  
│ حاول إرسال الإيموجي الصحيح للفوز بالجائزة 🎯`;

    message.reply(startMsg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        answer: randomQuestion.answer
      });
    });
  },

  onReply: async ({ message, Reply, event, usersData, api }) => {
    const { messageID, answer } = Reply;
    const userAnswer = event.body.trim();

    if (userAnswer === answer) {
      global.GoatBot.onReply.delete(messageID);
      message.unsend(event.messageReply.messageID);
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);
      const userName = await api.getUserInfo(event.senderID);
      const winMsg = 
`▸ ◉ مبروك يا ${userName[event.senderID].name}!  
│ لقد فزت بمبلغ ${reward} $ 💵  
│ استمر وحاول إرسال إيموجيات أكثر 🎉`;
      message.reply(winMsg);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } else {
      const failMsg = 
`▸ ◉ محاولة خاطئة  
│ آسف، هذا غير صحيح ❌  
│ حاول مرة أخرى 🔄`;
      message.reply(failMsg);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};