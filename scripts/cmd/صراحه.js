const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "صراحة",
    version: "1.1",
    author: "Loid Butter",
    countDown: 5,
    role: 0,
    shortDescription: "▸ ◉ احصل على سؤال صراحة عشوائي وأجب عليه",
    longDescription: "▸ ◉ يعطيك سؤال صراحة عشوائي ويحفظ إجابتك",
    category: "لعبة",
    guide: {
      ar: "{pn} صراحة - للحصول على سؤال جديد والإجابة عليه"
    }
  },

  onStart: async function ({ message }) {
    try {
      const truthQuestions = JSON.parse(fs.readFileSync("TRUTHQN.json", "utf8"));
      if (!truthQuestions.length) {
        return message.reply(`▸ ◉ ⚠️ | لا يوجد أسئلة متاحة حالياً`);
      }

      const randomIndex = Math.floor(Math.random() * truthQuestions.length);
      const randomQuestion = truthQuestions[randomIndex];

      const info = await message.reply(
`▸ ◉ سؤال صراحة عشوائي  
│ ${randomQuestion}  
▸ ◉ أرسل إجابتك الآن`
      );

      // حفظ الرد من المستخدم
      global.GoatBot.onReply.set(info.messageID, {
        question: randomQuestion,
        author: message.senderID,
        messageID: info.messageID
      });

    } catch (err) {
      console.error(err);
      message.reply(`▸ ◉ ❌ | حدث خطأ أثناء جلب السؤال`);
    }
  },

  onReply: async function ({ event, Reply, message }) {
    if (!Reply) return;

    const userAnswer = event.body.trim();
    const savePath = path.join(__dirname, "الاجابة.json");

    // حفظ إجابة واحدة فقط
    fs.writeFileSync(savePath, JSON.stringify({ answer: userAnswer }, null, 2), "utf8");

    message.reply(
`▸ ◉ ✅ | تم حفظ إجابتك  
│ إجابتك: ${userAnswer}`
    );

    global.GoatBot.onReply.delete(Reply.messageID);
  }
};