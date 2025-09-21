const fs = require('fs');

module.exports = {
  config: {
    name: "ترتيب",
    version: "1.3",
    author: "Mahim + gpt",
    role: 0,
    countdown: 10,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "لعبة فردية",
    shortDescription: { ar: "حل رموز الكلمة المعطاة خلال فترة زمنية محددة" },
    longDescription: { ar: "لعبة حيث عليك حل رموز كلمة معينة خلال فترة زمنية محددة للفوز بالجائزة" },
    guide: { ar: "{prefix}لعبة_الكلمات - ابدأ لعبة إعادة ترتيب الكلمات" }
  },

  onStart: async function ({ message, event, commandName }) {
    const words = JSON.parse(fs.readFileSync('words.json'));
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const shuffledWord = shuffleWord(randomWord);

    const startMsg = 
`▸ ◉ جاري بدء لعبة ترتيب الكلمات...
│ حاول تحل الكلمة قبل ما تنتهي المدة
▸ ◉ الكلمة المعطاة: "${shuffledWord}"`;

    message.reply(startMsg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        answer: randomWord
      });
    });
  },

  onReply: async ({ message, Reply, event, usersData, commandName }) => {
    const { author, messageID, answer } = Reply;

    if (formatText(event.body) === formatText(answer)) {
      global.GoatBot.onReply.delete(messageID);
      if (event.messageReply) message.unsend(event.messageReply.messageID);
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      const winMsg = 
`▸ ◉ مبروك!
│ لقد فزت بـ ${reward} دولار 💰
▸ استمر وحاول تحل كلمات أكثر`;

      await usersData.addMoney(event.senderID, reward);
      message.reply(winMsg);
    }
    else {
      const failMsg = 
`▸ ◉ محاولة خاطئة
│ آسف، هذا غير صحيح
▸ حاول مرة أخرى قبل انتهاء الوقت`;

      message.reply(failMsg);
    }
  }
};

function shuffleWord(word) {
  const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
  return shuffled === word ? shuffleWord(word) : shuffled;
}

function formatText(text) {
  return text.normalize("NFD").toLowerCase();
}