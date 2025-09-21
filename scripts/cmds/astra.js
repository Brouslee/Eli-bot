const axios = require('axios');

// ✅ تخزين مؤقت للذاكرة لكل مستخدم
const memoryCache = {};

module.exports.config = {
  name: "استرا",
  aliases: ["أسترا", "بوت", "قطي"],
  author: "𝙸𝙷𝙰𝙱",
  role: "member",
  category: "الذكاء AI",
  description: "استرا اللي ما يعرفش يجيبلك حلاً ولا حتى لمشكلة واحدة!",
  countDown: 5,
};

module.exports.handleEvent = async ({ api, event }) => {
  const { body, messageID, threadID, senderID, messageReply } = event;
  
  // ✅ التحقق من أن الرسالة هي رد على رسالة استرا
  if (messageReply && global.client.handler.reply.has(messageReply.messageID)) {
    const replyData = global.client.handler.reply.get(messageReply.messageID);
    
    if (replyData && replyData.name === "استرا" && replyData.author === senderID) {
      // إنشاء مساحة للمستخدم إذا لم تكن موجودة
      if (!memoryCache[senderID]) {
        memoryCache[senderID] = [];
      }
      
      memoryCache[senderID].push({ role: "user", content: body });
      
      try {
        api.setMessageReaction("✨", messageID, () => {}, true);
        
        const apiUrl = `https://www.smfahim.xyz/chatfun?question= ${encodeURIComponent(body)}`;
        const response = await axios.get(apiUrl);
        let replyText = response.data.gptfun || "يا سيدي، سؤالك صعب عليا! جرب أسئلة أسهل ☹️";
        
        memoryCache[senderID].push({ role: "bot", content: replyText });
        
        const goatReplies = [
          `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━\n${replyText} 🌝`,
          `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━\n${replyText} 🌝✨`,
          `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━━\n${replyText} 🌝`,
        ];
        
        const randomReply = goatReplies[Math.floor(Math.random() * goatReplies.length)];
        
        const sentMessage = await api.sendMessage(randomReply, threadID, (error, info) => {
          if (!error) {
            global.client.handler.reply.set(info.messageID, {
              author: senderID,
              type: "reply",
              name: "استرا",
              unsend: false,
            });
          }
        }, messageID);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
      } catch (error) {
        console.error("Error in handleEvent:", error);
        api.sendMessage("🚨 | حدث خطأ حاول لاحقاً", threadID, messageID);
      }
    }
  }
};

// ✅ دالة onStart ستظل كما هي لتتيح لك استخدام الأمر بشكل عادي إن أردت
module.exports.onStart = async ({ api, event, args }) => {
  const senderID = event.senderID;
  const query = args.join(" ").trim();
  
  if (!query) {
    // إرسال ملصق عشوائي مع رسالة مضحك
    const stickers = [
      "991029143015289", "2104083373373058", "1638337540203765", "1764952637392438", "705318178670566",
      "711332298241547", "563030450175478", "562165130273441", "1379790010029873", "3207369746067631"
    ];
    const sticker = stickers[Math.floor(Math.random() * stickers.length)];
    
    return api.sendMessage({
      sticker,
      body: "نعم حبي 🌝❤️"
    }, event.threadID, event.messageID);
  }
  
  // إنشاء مساحة للمستخدم إذا لم تكن موجودة
  if (!memoryCache[senderID]) {
    memoryCache[senderID] = [];
  }
  
  // إضافة السؤال إلى الذاكرة
  memoryCache[senderID].push({ role: "user", content: query });
  
  try {
    api.setMessageReaction("✨", event.messageID, () => {}, true);
    
    const apiUrl = `https://www.smfahim.xyz/chatfun?question= ${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    let replyText = response.data.gptfun || "ما فهمت حاجة! قولها بطريقة تانية يا زميلي 🙄";
    
    // إضافة الرد إلى الذاكرة
    memoryCache[senderID].push({ role: "bot", content: replyText });
    
    // تنسيق الرد على شكل جوت الماعز
    const goatReplies = [
      `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━\n${replyText} 🌝✨`,
      `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━━\n${replyText} 🌝`,
      `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━━\n${replyText} 🌝✨`,
      `🐱 | 𝗔𝘀𝘁𝗿𝗮 𝗔𝗜\n━━━━━━━━━━━━\n${replyText} 🌝`
    ];
    
    const randomReply = goatReplies[Math.floor(Math.random() * goatReplies.length)];
    
    const sentMessage = await api.sendMessage(randomReply, event.threadID, (error, info) => {
      if (!error) {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "reply",
          name: "استرا",
          unsend: false,
        });
      }
    });
    
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    
  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("🚨 | حدث خطأ حاول لاحقاً", event.threadID, event.messageID);
  }
};