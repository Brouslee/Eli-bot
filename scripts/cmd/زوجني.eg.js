const { createCanvas, loadImage } = require("canvas");

const axios = require("axios");

const fs = require("fs-extra");

const path = require("path");

module.exports = {

  config: {

    name: "زوجني",

    version: "1.4",

    author: "NTKhang",

    countDown: 10,

    role: 0,

    shortDescription: "زواج عشوائي",

    longDescription: "يركب صورتك وصورة شخص من الجنس الآخر على صورة زواج",

    category: "تسلية",

    guide: { ar: "{pn}" }

  },

  onStart: async function ({ api, event, usersData }) {

    if (!event.isGroup)

      return api.sendMessage("❌ هذا الأمر يعمل فقط في المجموعات.", event.threadID);

    const senderID = event.senderID;

    const senderData = await usersData.get(senderID);

    const gender = senderData.gender;

    if (![1, 2].includes(gender))

      return api.sendMessage("🏳️‍🌈 | آسف، هذا الأمر لا يدعم المثليين 😂", event.threadID);

    if ((senderData.money || 0) < 1000)

      return api.sendMessage("💸 | تحتاج إلى 1000 دينار لتتزوج. اجمع المزيد أولاً!", event.threadID);

    const threadInfo = await api.getThreadInfo(event.threadID);

    const members = threadInfo.participantIDs.filter(id => id !== senderID);

    let partnerID, partnerData;

    for (let i = 0; i < 30; i++) {

      const randomID = members[Math.floor(Math.random() * members.length)];

      const data = await usersData.get(randomID);

      if (data?.gender && data.gender !== gender) {

        partnerID = randomID;

        partnerData = data;

        break;

      }

    }

    if (!partnerID)

      return api.sendMessage("😢 لم أجد شريك/ة مناسب حالياً، حاول لاحقاً.", event.threadID);

    const isBoy = gender === 1;

    const boyID = isBoy ? senderID : partnerID;

    const girlID = isBoy ? partnerID : senderID;

    const boyName = isBoy ? senderData.name : partnerData.name;

    const girlName = isBoy ? partnerData.name : senderData.name;

    const lovePercent = Math.floor(Math.random() * 101);

    const imgURL = "https://i.postimg.cc/bwWJL0cr/1751030739751.jpg";

    const bg = await loadImage(imgURL);

    const canvas = createCanvas(bg.width, bg.height);

    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0);

    async function getAvatarUrl(userID) {

      try {

        const res = await axios.post("https://www.facebook.com/api/graphql/", null, {

          params: {

            doc_id: "5341536295888250",

            variables: JSON.stringify({ height: 512, scale: 1, userID, width: 512 })

          }

        });

        return res.data.data.profile.profile_picture.uri;

      } catch (e) {

        return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";

      }

    }

    const faces = [

      { id: girlID, x: 150, y: 170, size: 160 },

      { id: boyID, x: 410, y: 110, size: 170 }

    ];

    for (const { id, x, y, size } of faces) {

      try {

        const avatarUrl = await getAvatarUrl(id);

        const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });

        const avatar = await loadImage(response.data);

        ctx.save();

        ctx.beginPath();

        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);

        ctx.closePath();

        ctx.clip();

        ctx.drawImage(avatar, x, y, size, size);

        ctx.restore();

      } catch (err) {

        console.error(`⚠️ فشل تحميل صورة العضو ${id}:`, err.message);

        return api.sendMessage("⚠️ حدث خطأ أثناء تحميل صورة أحد الزوجين.", event.threadID);

      }

    }

    const filePath = path.join(__dirname, "cache", `zawaj-${event.threadID}.png`);

    fs.writeFileSync(filePath, canvas.toBuffer());

    senderData.money -= 1000;

    await usersData.set(senderID, senderData);

    const message = {

      body: `*💒 | تم الزواج بنجاح!\n❤️‍🔥 نسبة التوافق: ${lovePercent}%\n ${girlName} ❤️  ${boyName}\n💸 تم خصم 1000 دينار من حسابك.*`,

      attachment: fs.createReadStream(filePath)

    };

    const sendWithRetry = (retries = 2) => {

      api.sendMessage(message, event.threadID, (err) => {

        if (err && retries > 0) {

          console.warn("⏳ فشل الإرسال، إعادة المحاولة...");

          setTimeout(() => sendWithRetry(retries - 1), 1500);

        } else if (err) {

          console.error("❌ فشل الإرسال نهائيًا:", err);

        }

        fs.unlink(filePath, () => {}); 

      }, event.messageID);

    };

    setTimeout(() => sendWithRetry(), 1000);

  }

};