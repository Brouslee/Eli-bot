module.exports = {
  config: {
    name: "زوجني3",
    aliases: ["married3", "zwgni3"],
    version: "2.2",
    author: "kivv - معدل",
    countDown: 5,
    role: 0,
    shortDescription: "زوجني مع شخص",
    longDescription: "تقدر تتزوج أي شخص تاغه أو ترد عليه أو عشوائي + نسبة توافق وتعليق",
    category: "love",
    guide: "{pn} @منشن أو رد أو بدون"
  },

  onLoad: async function () {
    const { resolve } = require("path");
    const { existsSync, mkdirSync } = require("fs-extra");
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const path = resolve(__dirname, 'cache/canvas', 'marriedv5.png');
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.ibb.co/mhxtgwm/49be174dafdc259030f70b1c57fa1c13.jpg", path);
  },

  circle: async function (image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  makeImage: async function ({ one, two }) {
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const jimp = require("jimp");
    const __root = path.resolve(__dirname, "cache", "canvas");

    let base = await jimp.read(__root + "/marriedv5.png");
    let pathImg = __root + `/married_${Date.now()}_${Math.floor(Math.random()*9999)}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

    let circleOne = await jimp.read(await this.circle(avatarOne));
    let circleTwo = await jimp.read(await this.circle(avatarTwo));
    base.composite(circleOne.resize(130, 130), 300, 150).composite(circleTwo.resize(130, 130), 170, 230);

    let raw = await base.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    return pathImg;
  },

  onStart: async function ({ event, api, threadsData }) {
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;
    const mention = Object.keys(event.mentions);

    let one = senderID;
    let two;

    if (mention.length > 0) {
      two = mention[0];
    } else if (event.messageReply) {
      two = event.messageReply.senderID;
    } else {
      const threadInfo = await threadsData.get(threadID);
      const members = threadInfo.members.filter(m => m.userID != one);
      if (members.length == 0) return api.sendMessage("مافي حد أزوجك معاه 😅", threadID, messageID);
      const randomMember = members[Math.floor(Math.random() * members.length)];
      two = randomMember.userID;
    }

    const lovePercent = Math.floor(Math.random() * 101);

    // تعليقات عشوائية حسب النسبة
    let comment;
    if (lovePercent > 80) comment = "حب أسطوري ❤️🔥";
    else if (lovePercent > 50) comment = "علاقة حلوة 💕";
    else if (lovePercent > 30) comment = "ممكن تمشي 😅";
    else comment = "الله يستر منكم 😂";

    return this.makeImage({ one, two }).then(path =>
      api.sendMessage(
        {
          body: `💍 مبروك الزواج 😍\n${event.senderID == one ? "👤" : ""} @[${one}] ❤️ @[${two}]\nنسبة التوافق: ${lovePercent}%\n${comment}`,
          mentions: [
            { id: one, tag: "الزوج" },
            { id: two, tag: "الزوج/ة" }
          ],
          attachment: fs.createReadStream(path)
        },
        threadID,
        () => fs.unlinkSync(path),
        messageID
      )
    );
  }
};