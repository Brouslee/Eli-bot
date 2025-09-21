const fs = require("fs");

module.exports = {
  config: {
    name: "الذاكرة",
    aliases: ["mt"],
    version: "1.1",
    author: "محمد + GPT",
    role: 0,
    shortDescription: { ar: "▸ اختبار الذاكرة وربح فلوس 💰" },
    longDescription: { ar: "▸ قم بتذكر الإيموجيات وإرسالها بشكل صحيح لتحصل على مكافأة 🎯" },
    category: "لعبة فردية",
    guide: { ar: "{prefix}الذاكرة - ابدأ اللعبة وحاول تذكر الإيموجيات" }
  },

  onStart: async function ({ message, event }) {
    const emojiSequence = generateHardEmojiSequence();
    const originalSequence = generateEmojiMessage(emojiSequence);

    const startMsg = 
`▸ ◉ لعبة الذاكرة بدأت!
│ حاول تذكر هذه الإيموجيات:
${originalSequence}
▸ ◉ ستُرسل لك رسالة الرد بعد 5 ثواني`;

    try {
      const sentMessage = await message.reply(startMsg);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author: event.senderID,
        originalSequence: originalSequence
      });

      setTimeout(async () => {
        try { await message.unsend(sentMessage.messageID); } catch {}

        const replyMessage = await message.reply(
`▸ ◉ الآن قم بالرد على هذه الرسالة بإرسال الإيموجيات بالترتيب الصحيح`
        );

        global.GoatBot.onReply.set(replyMessage.messageID, {
          commandName: this.config.name,
          messageID: replyMessage.messageID,
          author: event.senderID,
          originalSequence: originalSequence
        });
      }, 5000);

    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    const repliedMessage = event.body.trim();
    const originalSequence = Reply.originalSequence;

    if (repliedMessage === originalSequence) {
      const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);

      const userName = await api.getUserInfo(event.senderID);
      await message.reply(
`▸ ◉ مبروك يا ${userName[event.senderID].name}!
│ لقد فزت بمبلغ ${reward} $ 💵
▸ ◉ استمر وحاول تذكر المزيد من الإيموجيات`
      );

    } else {
      await message.reply(
`▸ ◉ آسف، الإجابة غير صحيحة ❌
│ حاول مرة أخرى`
      );
    }

    setTimeout(async () => { try { await message.unsend(event.messageID); } catch {} }, 180000);

    if (Reply.commandName === this.config.name) {
      try { await message.unsend(Reply.messageID); } catch {}
    }
  }
};

// --- دوال مساعدة ---
function generateHardEmojiSequence() {
  const emojis = ["😁","😋","😊","😎","😄","😃","😆","😉","😅","😍","😘","😚","😙","😗","😛","😜","😝","😌","😒","😞"];
  const sequence = [];
  for (let i = 0; i < 5; i++) {
    const index = Math.floor(Math.random() * emojis.length);
    sequence.push(emojis[index]);
    emojis.splice(index, 1);
  }
  return sequence;
}

function generateEmojiMessage(emojis) {
  return emojis.join("");
}

function isValidEmojiSequence(message) {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
  return emojiRegex.test(message);
}