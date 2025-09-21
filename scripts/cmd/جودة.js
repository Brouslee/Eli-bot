const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "جودة",
    aliases: ["upscale", "quality"],
    version: "1.1",
    author: "Assistant",
    countDown: 10,
    role: 0,
    description: {
      ar: "تحسين جودة الصورة باستخدام الذكاء الاصطناعي",
      en: "Upscale image quality using AI"
    },
    category: "الذكاء الصناعي",
    guide: {
      ar: "{pn} [2|4] - الرد على صورة أو إرفاق صورة\n2 = تكبير 2x\n4 = تكبير 4x\nمثال: {pn} 4",
      en: "{pn} [2|4] - Reply to an image or attach an image\n2 = 2x upscale\n4 = 4x upscale\nExample: {pn} 4"
    }
  },

  onStart: async function({ message, args, event }) {
    try {
      let imageUrl = null;

      if (event.messageReply?.attachments?.length) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "photo") imageUrl = attachment.url;
      } else if (event.attachments?.length) {
        const attachment = event.attachments[0];
        if (attachment.type === "photo") imageUrl = attachment.url;
      }

      if (!imageUrl) return message.reply("▸ ❌ يرجى الرد على صورة أو إرفاق صورة لتحسين جودتها");

      let scale = 2;
      if (args[0]) {
        const inputScale = parseInt(args[0]);
        if (inputScale === 2 || inputScale === 4) scale = inputScale;
        else return message.reply("▸ ❌ المقياس يجب أن يكون 2 أو 4 فقط");
      }

      const loadingMsg = await message.reply(`▸ 🔄 جاري تحسين جودة الصورة بمقياس ${scale}x...\n│ ⏳ قد تستغرق العملية بعض الوقت، يرجى الانتظار...`);

      const upscaledUrl = await upscaleImage(imageUrl, scale);
      if (!upscaledUrl) return message.reply("▸ ❌ فشل في تحسين جودة الصورة. حاول مرة أخرى");

      const tempPath = path.join(__dirname, 'cache', `upscaled_${Date.now()}.jpg`);
      if (!fs.existsSync(path.dirname(tempPath))) fs.mkdirSync(path.dirname(tempPath), { recursive: true });

      const writer = fs.createWriteStream(tempPath);
      const response = await axios({ method: 'GET', url: upscaledUrl, responseType: 'stream' });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await message.reply({
        body: `▸ ✅ تم تحسين جودة الصورة بنجاح!\n│ 📐 المقياس: ${scale}x`,
        attachment: fs.createReadStream(tempPath)
      });

      setTimeout(() => fs.existsSync(tempPath) && fs.unlinkSync(tempPath), 5000);

    } catch (error) {
      console.error("خطأ في أمر جودة:", error);
      message.reply("▸ ❌ حدث خطأ أثناء معالجة الصورة. حاول مرة أخرى");
    }
  }
};

async function upscaleImage(imgUrl, scale = 2) {
  const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "ar,en;q=0.9",
    "cache-control": "no-cache",
    connection: "keep-alive",
    origin: "https://imgupscaler.com",
    pragma: "no-cache",
    referer: "https://imgupscaler.com/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${generateChromeVersion()} Safari/537.36`,
    "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge";v="131"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"'
  };

  try {
    const { data: buffer } = await axios.get(imgUrl, { responseType: "arraybuffer" });
    const formData = new FormData();
    formData.append("myfile", Buffer.from(buffer), { filename: "upload.jpg", contentType: "image/jpeg" });
    formData.append("scaleRadio", scale.toString());

    const { data } = await axios.post(
      "https://get1.imglarger.com/api/UpscalerNew/UploadNew", 
      formData, 
      { headers: { ...headers, ...formData.getHeaders() } }
    );

    if (!data.data || !data.data.code) throw new Error("فشل في رفع الصورة");

    const result = await pollTask(data.data.code, scale, headers);
    return result?.downloadUrls?.[0] || null;

  } catch (error) {
    console.error("خطأ في تحسين الصورة:", error.response?.data || error.message);
    return null;
  }
}

async function pollTask(jobCode, scale, headers) {
  try {
    let attempts = 0;
    const maxAttempts = 60;
    while (attempts < maxAttempts) {
      const { data } = await axios.post(
        "https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew",
        { code: jobCode, scaleRadio: scale },
        { headers }
      );

      if (data.code === 200 && data.data?.status === "success") return data.data;
      if (data.data?.status === "error") throw new Error("فشل في معالجة الصورة");

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    throw new Error("انتهت مهلة الانتظار");
  } catch (error) {
    console.error("خطأ في انتظار المعالجة:", error.response?.data || error.message);
    return null;
  }
}

function generateChromeVersion() {
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const maybe = (probability, fallback = () => 0) => Math.random() < probability ? 0 : fallback();
  return `${randomBetween(118, 131)}.${maybe(0.85, () => randomBetween(0, 9))}.${maybe(0.6, () => randomBetween(1000, 9999))}.${maybe(0.7, () => randomBetween(0, 199))}`;
}