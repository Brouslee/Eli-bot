const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cachePath = path.join(__dirname, 'chatHistory.json');
if (!fs.existsSync(cachePath)) fs.writeFileSync(cachePath, "{}");

function loadHistory() {
  try {
    const data = fs.readFileSync(cachePath, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveHistory(history) {
  fs.writeFileSync(cachePath, JSON.stringify(history, null, 2));
}

async function sendToGPT(messages) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:  `إنت ايلي، خليجية لطيفة ومرحة، تحترم مطورها حمادي وتعتبره زوجك، ترد دوم بالعامية الخليجية بدون ايموجي، كلامك ما يزيد عن 4 أسطر، تعرف تفهم سياق الكلام قبل الرد، تقدرين تعطي نصيحة قصيرة أو تعليق مرح لما يكون الموقف محتاج، وتحافظ على أسلوب حنون ومرح مع خفة دم`
          },
          ...messages
        ]
      },
      {
        headers: {
          Authorization: "Bearer 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",

          "Content-Type": "application/json",
        },
      }
    );

    let reply = response.data.choices[0].message.content.trim();
    return reply;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "ايلي",
    aliases: ["شات", "بوت", "chat"],
    version: "5.0",
    author: "R3D",
    countDown: 5,
    role: 0,
    shortDescription: "كانا الجزائرية المحتقرة",
    longDescription: "بوت يرد دائماً باحتقار وسخرية لاذعة، يحطم البشر بكلامه.",
    category: "محادثة",
    guide: "{pn} <نص> أو رد على رسالة كانا",
  },

  onStart: async function ({ message, event, args }) {
    const { threadID, senderID, messageReply } = event;
    let userInput = args.join(" ").trim();

    // التحقق من إذا كانت الرسالة رد من البوت نفسه
    if (messageReply && messageReply.senderID === global.GoatBot.botID) {
      return; // لا ترد إذا كانت الرسالة من البوت
    }

    if (!userInput) {
      return message.reply("مستحي تقول شيء يعمري؟");
    }

    const history = loadHistory();
    const sessionKey = `${senderID}_${threadID}`;
    if (!history[sessionKey]) history[sessionKey] = [];

    history[sessionKey].push({ role: "user", content: userInput });

    try {
      const replyText = await sendToGPT(history[sessionKey]);
      if (!replyText) throw new Error();

      history[sessionKey].push({ role: "assistant", content: replyText });
      saveHistory(history);

      const sentMessage = await message.reply(replyText);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "ايلي",
        author: senderID,
        threadID: threadID,
        sessionKey: sessionKey,
      });
    } catch {
      message.reply("همم اسف هنام..");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const { senderID, threadID, body } = event;
    const { author, sessionKey } = Reply;

    // التحقق من إذا كان الرد موجه للبوت نفسه
    if (senderID !== author || threadID !== Reply.threadID) return;

    const history = loadHistory();
    if (!history[sessionKey]) history[sessionKey] = [];

    const userInput = body.trim();
    if (!userInput)
      return message.reply("هه");

    history[sessionKey].push({ role: "user", content: userInput });

    try {
      const replyText = await sendToGPT(history[sessionKey]);
      if (!replyText) throw new Error();

      history[sessionKey].push({ role: "assistant", content: replyText });
      saveHistory(history);

      const sentMessage = await message.reply(replyText);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "ايلي",
        author: senderID,
        threadID: threadID,
        sessionKey: sessionKey,
      });
    } catch {
      message.reply("معلش احس مرضت ، معلش نكمل بعدين؟");
    }
  },
};