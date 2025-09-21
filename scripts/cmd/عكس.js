const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "عكس",
    version: "1.4",
    author: "حسين يعقوبي",
    role: 0,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "لعبة فردية",
    shortDescription: { ar: "▸ خمن عكس الكلمة المعطاة" },
    longDescription: { ar: "▸ يعطيك الكود كلمة ويجب أن تعرف عكسها للفوز بالجائزة" },
    guide: { ar: "{prefix}عكس - ابدأ لعبة عكس الكلمات" }
  },

  onStart: async function({ message, event }) {
    const filePath = path.join(__dirname, 'Offices', 'revers.json');
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const randomQ = questions[Math.floor(Math.random() * questions.length)];

    const startMsg = 
`▸ ◉ لعبة عكس الكلمات بدأت
│ حاول معرفة العكس للكلمة التالية
▸ "${randomQ.question}"
│ لديك 3 محاولات فقط`;

    message.reply(startMsg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        messageID: info.messageID,
        author: event.senderID,
        answer: randomQ.answer,
        attempts: 0
      });
    });
  },

  onReply: async ({ message, Reply, event, usersData }) => {
    const { messageID, answer } = Reply;
    const userAnswer = event.body.trim().toLowerCase();

    Reply.attempts = Reply.attempts ? Reply.attempts + 1 : 1;

    if (userAnswer === answer.toLowerCase()) {
      global.GoatBot.onReply.delete(messageID);
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);

      const userName = await global.utils.getName(event.senderID);
      const winMsg = 
`▸ ◉ مبروك ${userName}
│ الإجابة صحيحة
▸ حصلت على: ${reward} دولار
│ استمر في اللعب لتزيد مكافآتك`;

      message.reply(winMsg);
    } else if (Reply.attempts >= 3) {
      global.GoatBot.onReply.delete(messageID);
      message.reply(`▸ ◉ انتهت المحاولات
│ الإجابة الصحيحة: ${answer}
▸ لا تقلق، حاول مرة أخرى في اللعبة القادمة`);
    } else {
      message.reply(`▸ ◉ محاولة خاطئة
│ حاول مرة أخرى (محاولة ${Reply.attempts}/3)`);
    }
  }
};