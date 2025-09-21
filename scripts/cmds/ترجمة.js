const axios = require('axios');  
const defaultEmojiTranslate = "🌐";  

module.exports = {  
  config: {  
    name: "ترجمة",  
    aliases: ["trans"],  
    version: "1.6",  
    author: "𝙸𝙷𝙰𝙱",  
    countDown: 5,  
    role: 0,  
    description: "ترجم النص إلى اللغة المطلوبة",  
    category: "الوسائط",  
    guide: "{pn} <نص>: لترجمة النص إلى لغة صندوق الدردشة أو اللغة الافتراضية للروبوت\n" +
           "{pn} <نص> -> <رمز اللغة>: لترجمة النص إلى اللغة المطلوبة\n" +
           "أو الرد على رسالة لترجمة محتواها\n" +
           "مثال:\n" +
           " {pn} مرحبًا -> ar\n" +
           "{pn} -r [تشغيل | إيقاف]: لتشغيل أو إيقاف الترجمة التلقائية عند التفاعل\n" +
           "{pn} -r تعيين <رمز تعبيري>: لتعيين الرمز التعبيري لترجمة الرسائل"  
  },  

  langs: {  
    ar: {  
      translateTo: "▸ ◉ 🌐 ترجمة من %1 إلى %2",  
      invalidArgument: "▸ ◉ ❌ حجة غير صالحة، يرجى اختيار تشغيل أو إيقاف",  
      turnOnTransWhenReaction: `▸ ◉ ✅ تم تشغيل الترجمة عند التفاعل\n│ جرب التفاعل بـ "${defaultEmojiTranslate}" على أي رسالة لترجمتها`,  
      turnOffTransWhenReaction: "▸ ◉ ✅ تم إيقاف الترجمة عند التفاعل",  
      inputEmoji: "▸ ◉ 🌀 تفاعل مع هذه الرسالة لتعيين هذا الرمز التعبيري للترجمة",  
      emojiSet: "▸ ◉ ✅ تم تعيين الرمز التعبيري للترجمة إلى %1",  
      translating: "▸ ◉ جاري الترجمة...\n│ يرجى الانتظار قليلًا",  
      translated: "▸ ◉ ✅ تمت الترجمة بنجاح"  
    }  
  },  

  onStart: async function({ message, event, args, threadsData, getLang, commandName }) {  
    if (["-r", "-react", "-reaction"].includes(args[0])) {  
      if (args[1] == "set") {  
        return message.reply(getLang("inputEmoji"), (err, info) =>  
          global.GoatBot.onReaction.set(info.messageID, {  
            type: "setEmoji",  
            commandName,  
            messageID: info.messageID,  
            authorID: event.senderID  
          })  
        );  
      }  

      const isEnable = args[1] == "تشغيل" ? true : args[1] == "إيقاف" ? false : null;  
      if (isEnable == null) return message.reply(getLang("invalidArgument"));  

      await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");  
      return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));  
    }  

    const { body = "" } = event;  
    let content;  
    let langCodeTrans;  
    const langOfThread = await threadsData.get(event.threadID, "data.lang") || "ar";  

    if (event.messageReply) {  
      content = event.messageReply.body;  
      let lastIndexSeparator = body.lastIndexOf("->");  
      if (lastIndexSeparator == -1) lastIndexSeparator = body.lastIndexOf("=>");  

      if (lastIndexSeparator != -1 && (body.length - lastIndexSeparator == 4 || body.length - lastIndexSeparator == 5))  
        langCodeTrans = body.slice(lastIndexSeparator + 2);  
      else  
        langCodeTrans = langOfThread;  
    } else {  
      content = event.body;  
      let lastIndexSeparator = content.lastIndexOf("->");  
      if (lastIndexSeparator == -1) lastIndexSeparator = content.lastIndexOf("=>");  

      if (lastIndexSeparator != -1 && (content.length - lastIndexSeparator == 4 || content.length - lastIndexSeparator == 5)) {  
        langCodeTrans = content.slice(lastIndexSeparator + 2);  
        content = content.slice(content.indexOf(args[0]), lastIndexSeparator);  
      } else  
        langCodeTrans = langOfThread;  
    }  

    if (!content) return message.SyntaxError();  

    message.reply(getLang("translating"));  
    translateAndSendMessage(content, langCodeTrans, message, getLang);  
  },  

  onChat: async ({ event, threadsData }) => {  
    if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction")) return;  
    global.GoatBot.onReaction.set(event.messageID, {  
      commandName: 'translate',  
      messageID: event.messageID,  
      body: event.body,  
      type: "translate"  
    });  
  },  

  onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {  
    switch (Reaction.type) {  
      case "setEmoji": {  
        if (event.userID != Reaction.authorID) return;  
        const emoji = event.reaction;  
        if (!emoji) return;  
        await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");  
        return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));  
      }  
      case "translate": {  
        const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🌐";  
        if (event.reaction == emojiTrans) {  
          const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || "ar";  
          const content = Reaction.body;  
          Reaction.delete();  
          message.reply(getLang("translating"));  
          translateAndSendMessage(content, langCodeTrans, message, getLang);  
        }  
      }  
    }  
  }  
};  

async function translate(text, langCode) {  
  const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);  
  return {  
    text: res.data[0].map(item => item[0]).join(''),  
    lang: res.data[2]  
  };  
}  

async function translateAndSendMessage(content, langCodeTrans, message, getLang) {  
  const { text, lang } = await translate(content.trim(), langCodeTrans.trim());  
  return message.reply(`${text}\n\n${getLang("translateTo", lang, langCodeTrans)}\n▸ ◉ ✅ تمت الترجمة بنجاح`);  
}