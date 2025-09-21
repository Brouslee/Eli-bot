const axios = require("axios");

module.exports = {
  config: {
    name: "فوندي",
    version: "1.0",
    author: "محمد",
    role: 0,
    shortDescription: "تحويل نص الى فيديو مع ترجمة",
    longDescription: "أخذ نص المستخدم، ترجمته عبر API، وإرساله للـ API فوندي",
    category: "media",
    guide: "{pn} النص"
  },

  onStart: async function ({ message, args, senderName }) {
    if (args.length === 0) {
      return message.reply("اكتب النص اللي تبيه بعد الامر");
    }

    const userText = args.join(" ");
    message.reply("⏳ جاري ترجمة النص عبر API...");

    let translatedText;
    try {
      // استخدم أي API ترجمة رسمي
      const translateRes = await axios.get("https://api.mymemory.translated.net/get", {
        params: {
          q: userText,
          langpair: "ar|en" // من عربي لإنجليزي
        }
      });

      translatedText = translateRes.data.responseData.translatedText;
    } catch (err) {
      console.error("خطأ بالترجمة:", err);
      return message.reply("❌ صار خطأ بالترجمة عبر API");
    }

    const query = encodeURIComponent(translatedText);
    const url = `https://rapido.zetsu.xyz/api/vondy?keyword=${query}`;

    let videoData;
    try {
      const res = await axios.get(url);
      videoData = res.data;

      if (!videoData || !videoData.result) {
        return message.reply("⚠️ لم يتم استلام فيديو من API فوندي");
      }
    } catch (err) {
      console.error("خطأ بالاتصال بالـ API:", err);
      return message.reply("❌ صار خطأ بالاتصال مع API فوندي");
    }

    try {
      const replyText = `المستخدم: '${senderName}'\nالنص: "${userText}"`;
      await message.reply({
        body: replyText,
        attachment: await global.utils.getStreamFromURL(videoData.result)
      });
    } catch (err) {
      console.error("خطأ بإرسال الفيديو:", err);
      return message.reply("❌ صار خطأ بإرسال الفيديو");
    }
  }
};