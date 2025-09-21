const fs = require('fs');

module.exports = {
  config: {
    name: "تفكيك",
    version: "1.1",
    author: "حسين يعقوبي + gpt",
    role: 0,
    countdown: 10,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "العاب",
    shortDescription: { ar: "لعبة تفكيك الكلمات" },
    longDescription: { ar: "يقوم هذا الكود بإعطائك كلمة من أجل تفكيكها" },
    guide: { ar: "{prefix}تفكيك - ابدأ لعبة تفكيك الكلمات" }
  },

  onStart: async function ({ message, event, commandName }) {
    const questions = JSON.parse(fs.readFileSync('dismantling.json'));
    const randomQuestionObj = questions[Math.floor(Math.random() * questions.length)];

    const startMsg = 
`▸ ◉ لعبة تفكيك الكلمات بدأت!
│ حاول تفكيك الكلمة التالية خلال ${this.config.countdown} ثانية
▸ الكلمة: "${randomQuestionObj.question}"`;

    message.reply(startMsg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        answer: randomQuestionObj.answer
      });
    });
  },

  onReply: async ({ message, Reply, event, usersData, api }) => {
    const { author, messageID, answer } = Reply;
    const userAnswer = event.body.trim();

    if (userAnswer === answer) {
      global.GoatBot.onReply.delete(messageID);
      message.unsend(event.messageReply.messageID);
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);

      const userName = await api.getUserInfo(event.senderID);
      const winMsg = 
`▸ ◉ تهانينا يا ${userName[event.senderID].name}!
│ لقد حزرت الكلمة بنجاح وفزت بـ ${reward} دولار 💰`;
      message.reply(winMsg);
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    } else {
      const failMsg = 
`▸ ◉ محاولة خاطئة
│ آسف، هذا غير صحيح`;
      message.reply(failMsg);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  }
};