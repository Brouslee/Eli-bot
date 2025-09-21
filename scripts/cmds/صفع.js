const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "صفع",
    version: "1.4",
    author: "Darkx",
    countDown: 5,
    role: 2,
    shortDescription: "صفع شخص مع صورة أنمي",
    longDescription: "يضع صورة المصفوع والمرسل داخل صورة صفعة أنمي",
    category: "ميمز وتعديل الصور"
  },

  onStart: async function ({ message, event }) {
    let targetID;


    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else {
      return message.reply("من أصفع؟ 😕 اعمل رد على رسالة أو منشن شخص.");
    }

    const senderID = event.senderID;

    const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
    const senderAvatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${accessToken}`;
    const targetAvatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

    const baseImageUrl = "https://l.top4top.io/p_3463rv2z90.jpg"; 

    try {
      const [baseImg, senderImg, targetImg] = await Promise.all([
        loadImage(baseImageUrl),
        loadImage(senderAvatar),
        loadImage(targetAvatar)
      ]);

      const canvas = Canvas.createCanvas(baseImg.width, baseImg.height);
      const ctx = canvas.getContext("2d");


      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);


      ctx.save();
      ctx.beginPath();
      ctx.arc(140, 270, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetImg, 60, 190, 160, 160);
      ctx.restore();


      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width - 140, 270, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(senderImg, canvas.width - 220, 190, 160, 160);
      ctx.restore();


      const filePath = path.join(__dirname, "..", "cache", `slap_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, canvas.toBuffer());


      await message.reply({
        body: "💢 صفعة محترمة تم تنفيذها!",
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => fs.unlink(filePath).catch(() => {}), 20 * 1000);
    } catch (err) {
      console.error("خطأ في أمر الصفع:", err);
      return message.reply("❌ حدث خطأ أثناء تنفيذ الصفعة.");
    }
  }
};


async function loadImage(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Canvas.loadImage(res.data);
                 }
