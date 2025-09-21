const fs = require('fs');

module.exports = {
  config: {
    name: "عواصم",
    version: "1.2",
    author: "Mahim",
    role: 0,
    countdown: 10,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "لعبة فردية",
    shortDescription: { ar: "خمن عاصمة الدولة من بين 3 خيارات" },
    longDescription: { ar: "يعطيك هذا الكود اسم الدولة ويجب عليك اختيار عاصمتها الصحيحة من بين 3 خيارات" },
    guide: { ar: "{prefix}عواصم - ابدأ لعبة عواصم الدول" }
  },

  onStart: async function ({ message, event, commandName }) {
    const questions = JSON.parse(fs.readFileSync('capitals.json'));
    const randomQuestionObj = questions[Math.floor(Math.random() * questions.length)];

    let otherOptions = questions
      .filter(q => q.answer !== randomQuestionObj.answer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map(q => q.answer);

    const options = [randomQuestionObj.answer, ...otherOptions].sort(() => 0.5 - Math.random());

    const startMsg = 
`▸ ◉ لعبة جديدة: خمن عاصمة الدولة
│ الدولة: ${randomQuestionObj.question}
▸ الخيارات:
1. ${options[0]}
2. ${options[1]}
3. ${options[2]}
│ أرسل رقم الخيار الصحيح`;

    const info = await message.reply(startMsg);
    global.GoatBot.onReply.set(info.messageID, {
      commandName,
      messageID: info.messageID,
      author: event.senderID,
      answer: options.indexOf(randomQuestionObj.answer) + 1
    });
  },

  onReply: async ({ message, Reply, event, usersData, api, commandName }) => {
    const { messageID, answer } = Reply;
    const userAnswer = parseInt(event.body.trim());

    if (userAnswer === answer) {
      global.GoatBot.onReply.delete(messageID);
      if (event.messageReply && event.messageReply.messageID) {
        message.unsend(event.messageReply.messageID).catch(() => {});
      }
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);
      const userName = await api.getUserInfo(event.senderID);
      const winMsg = 
`▸ ◉ تهانينا
│ لقد حزرت عاصمة الدولة بنجاح
▸ ${userName[event.senderID].name} فزت بمبلغ ${reward} دولار
│ استمر في اللعب لتجمع المزيد من المكافآت`;

      message.reply(winMsg);
    } else {
      const failMsg = 
`▸ ◉ محاولة خاطئة
│ آسف، هذا غير صحيح
▸ حاول مرة أخرى واختَر رقم الخيار الصحيح`;
      message.reply(failMsg);
    }
  }
};