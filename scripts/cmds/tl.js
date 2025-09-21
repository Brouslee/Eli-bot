const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  config: {
    name: "تلوين",
    version: "1.0",
    author: "محمد",
    role: 0,
    shortDescription: {
      ar: "تلوين الصور عبر imgbb + API"
    },
    longDescription: {
      ar: "قم برفع الصورة على imgbb عن طريق الرد عليها ثم تلوينها"
    },
    category: "خدمات",
    guide: {
      ar: "{pn} (ارسل صورة أو رد على صورة)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25";
    let imageUrl;

    // لو رد على صورة
    if (event.messageReply?.attachments?.[0]?.url) {
      const linkanh = event.messageReply.attachments[0].url;

      try {
        // نرفع الصورة لـ imgbb
        const response = await axios.get(linkanh, { responseType: 'arraybuffer' });
        const formData = new FormData();
        formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });

        const res = await axios.post('https://api.imgbb.com/1/upload', formData, {
          headers: formData.getHeaders(),
          params: { key: imgbbApiKey }
        });

        imageUrl = res.data.data.url;
      } catch (error) {
        console.error(error);
        return api.sendMessage('❌ فشل رفع الصورة إلى imgbb.', event.threadID, event.messageID);
      }
    } else if (args[0]) {
      // لو عطى رابط مباشر
      imageUrl = args[0];
    } else {
      return api.sendMessage('⚠️ ارسل رابط الصورة أو رد على صورة لتلوينها.', event.threadID, event.messageID);
    }

    api.sendMessage("⏳ جاري تلوين الصورة...", event.threadID, event.messageID);

    try {
      // نرسل الصورة لـ API التلوين
      const apiUrl = `https://rapido.zetsu.xyz/api/colorize-image?imageUrl=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.result) {
        return api.sendMessage("⚠️ لم يتم استلام الصورة الملونة من API", event.threadID, event.messageID);
      }

      const stream = await global.utils.getStreamFromURL(res.data.result);
      return api.sendMessage({ body: "✅ هذه الصورة بعد التلوين", attachment: stream }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ صار خطأ بالاتصال مع API التلوين", event.threadID, event.messageID);
    }
  }
};