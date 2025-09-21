const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "عناق",
    aliases: ["us"],
    version: "1.0",
    author: "AceGun × تعديل محمد",
    countDown: 5,
    role: 0,
    shortDescription: "نحن معا",
    longDescription: "",
    category: "",
    guide: "{pn} @منشن"
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) {
      return message.reply("⚠️ | المرجو عمل منشن للشخص الذي تريد عناقه 🙂");
    }

    let one, two;
    if (mention.length === 1) {
      one = event.senderID;
      two = mention[0];
    } else {
      one = mention[1];
      two = mention[0];
    }

    try {
      const imagePath = await makeHugImage(one, two);
      await message.reply({
        body: "فقط أنتي وأنا 🥰",
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlink(imagePath, () => {});
    } catch (err) {
      console.error("خطأ أثناء إنشاء صورة العناق:", err);
      message.reply("حدث خطأ أثناء تجهيز صورة العناق 😅");
    }
  }
};

async function makeHugImage(one, two) {
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const avatarOneURL = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`;
  const avatarTwoURL = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`;
  const bgURL = "https://i.ibb.co/3YN3T1r/q1y28eqblsr21.jpg";

  const [bg, avatarOne, avatarTwo] = await Promise.all([
    loadImage(await fetchImageBuffer(bgURL)),
    loadImage(await fetchImageBuffer(avatarOneURL)),
    loadImage(await fetchImageBuffer(avatarTwoURL))
  ]);

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(bg, 0, 0, bg.width, bg.height);

  // رسم الصور على شكل دائرة
  ctx.save();
  ctx.beginPath();
  ctx.arc(320 + 75, 100 + 75, 75, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarOne, 320, 100, 150, 150);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(280 + 65, 280 + 65, 65, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarTwo, 280, 280, 130, 130);
  ctx.restore();

  const outputPath = path.join(__dirname, "hug.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
  return outputPath;
}

async function fetchImageBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return res.data;
}
