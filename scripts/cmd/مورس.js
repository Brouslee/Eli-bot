const axios = require("axios");

module.exports = {
  config: {
    name: "مورس",
    version: "1.2",
    author: "Jun",
    countDown: 5,
    role: 0,
    shortDescription: "▸ تحويل النص إلى مورس أو من مورس إلى نص",
    longDescription: "▸ هذا الأمر يحول النص العادي إلى شفرة مورس أو يحول شفرة مورس إلى نص عادي",
    category: "أدوات",
    guide: "<النص أو المورس>"
  },

  onStart: async function ({ api, event, args }) {
    if (args.length === 0) 
      return api.sendMessage("▸ ◉ تنبيه\n│ الرجاء إدخال نص أو شفرة مورس للتحويل", event.threadID);

    const النص = args.join(" ");

    try {
      const isMorse = /^[.\-\s]+$/.test(النص);

      if (isMorse) {
        const res = await axios.get(`https://api.popcat.xyz/morsetotext?text=${encodeURIComponent(النص)}`);
        return api.sendMessage(`▸ ◉ النص الناتج من شفرة مورس\n│ ${res.data.text}`, event.threadID, event.messageID);
      } else {
        const res = await axios.get(`https://api.popcat.xyz/texttomorse?text=${encodeURIComponent(النص)}`);
        return api.sendMessage(`▸ ◉ النص بالمورس\n│ ${res.data.morse}`, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("▸ ◉ خطأ\n│ حدث خطأ أثناء التحويل، حاول مرة أخرى", event.threadID, event.messageID);
    }
  }
};