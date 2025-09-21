const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "زوجني2",
    aliases: ["marry2", "zwgni2"],
    version: "2.0",
    author: "Akash - معدل",
    countDown: 5,
    role: 0,
    shortDescription: "زوجني مع أي شخص",
    longDescription: "يخليك تتزوج أي حد تاغه أو رده أو يختار عشوائي",
    category: "love",
    guide: "{pn} @منشن أو رد أو بدون",
  },

  onStart: async function ({ message, event, args, usersData, threadsData }) {
    const mention = Object.keys(event.mentions);

    let one = event.senderID;
    let two;

    // لو فيه منشن
    if (mention.length > 0) {
      two = mention[0];
    }
    // لو فيه رد
    else if (event.messageReply) {
      two = event.messageReply.senderID;
    }
    // لو ما فيه لا منشن ولا رد يختار عشوائي من الجروب
    else {
      const threadInfo = await threadsData.get(event.threadID);
      const members = threadInfo.members.filter(m => m.userID != one);
      if (members.length == 0) return message.reply("مافي حد أزوجك معاه 😅");
      const randomMember = members[Math.floor(Math.random() * members.length)];
      two = randomMember.userID;
    }

    // نفذ الزواج
    bal(one, two).then(ptth => {
      message.reply({
        body: "💍 مبروك الزواج 😍",
        attachment: fs.createReadStream(ptth),
      }, () => fs.unlinkSync(ptth));
    });
  }
};

async function bal(one, two) {
  const avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();

  const avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();

  const img = await jimp.read("https://i.postimg.cc/XN1TcH3L/tumblr-mm9nfpt7w-H1s490t5o1-1280.jpg");
  img.resize(1024, 684)
    .composite(avone.resize(85, 85), 204, 160)
    .composite(avtwo.resize(80, 80), 315, 105);

  const pth = `marry_${Date.now()}_${Math.floor(Math.random()*9999)}.png`;
  await img.writeAsync(pth);
  return pth;
}