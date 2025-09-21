const axios = require('axios');

module.exports = {
  config: {
    name: "وايفو",
    version: "3.1",
    author: "حسين يعقوبي + gpt",
    role: 0,
    countdown: 5,
    category: "انمي",
    shortDescription: { ar: "عرض صور أنمي" },
    longDescription: { ar: "إرسال صور أنمي متنوعة من أنواع مختلفة" },
    guide: { ar: "{prefix}وايفو <النوع>" }
  },

  onStart: async function ({ message, args, event, commandName }) {
    const typesMap = {
      "وايفو": "waifu",
      "نيكو": "neko",
      "شينوبو": "shinobu",
      "ميغومين": "megumin",
      "مزاح": "bully",
      "حضن": "cuddle",
      "بكاء": "cry",
      "قبلة": "kiss",
      "لحس": "lick",
      "عناق": "hug",
      "ذئب": "awoo",
      "ربت": "pat",
      "مغرور": "smug",
      "ضربة": "bonk",
      "يطير": "yeet",
      "خجل": "blush",
      "ابتسامة": "smile",
      "موجة": "wave",
      "تصفيحة": "highfive",
      "إمساك يد": "handhold",
      "أكل": "nom",
      "عضة": "bite",
      "قفزة": "glomp",
      "صفعة": "slap",
      "قتل": "kill",
      "ركلة": "kick",
      "سعيد": "happy",
      "غمزة": "wink",
      "نغز": "poke",
      "رقصة": "dance",
      "إحراج": "cringe"
    };

    const name = args.join(" ").trim();
    if (!name) {
      let keys = Object.keys(typesMap);
      let list = "▸ ◉ قائمة الأنواع المتاحة:\n";
      list += "│ " + keys.join("، ") + "\n";
      list += "▸ ◉ للتجربة:\n";
      list += "│ اكتب مثلا: \"وايفو حضن\"";
      return message.reply(list);
    }

    const engName = typesMap[name];
    if (!engName) {
      return message.reply("⚠ | النوع الذي كتبته غير موجود، حاول مرة أخرى.");
    }

    async function sendImage() {
      try {
        let res = await axios.get(`https://api.waifu.pics/sfw/${engName}`);
        let img = res.data.url;

        const form = { body: `▸ ◉ صورة من نوع: ${name}\n│ تفاعل ب 👍 لتحصل على صورة جديدة` };
        if (img) form.attachment = await global.utils.getStreamFromURL(img);

        message.reply(form, (err, info) => {
          global.GoatBot.onReaction.set(info.messageID, {
            commandName,
            type: "waifu",
            engName,
            name,
            author: event.senderID
          });
        });
      } catch {
        message.reply("✖ | حدث خطأ أثناء جلب الصورة، حاول لاحقًا.");
      }
    }

    await sendImage();
  },

  onReaction: async ({ event, Reaction, message }) => {
    if (event.reaction !== "👍") return;
    const { engName, name, author } = Reaction;
    if (event.userID !== author) return;

    try {
      let res = await axios.get(`https://api.waifu.pics/sfw/${engName}`);
      let img = res.data.url;

      const form = { body: `▸ ◉ صورة أخرى من نوع: ${name}\n│ تفاعل ب 👍 لتحصل على صورة جديدة` };
      if (img) form.attachment = await global.utils.getStreamFromURL(img);

      message.send(form, (err, info) => {
        global.GoatBot.onReaction.set({
          ...Reaction,
          messageID: info.messageID
        });
      });
    } catch {
      message.send("✖ | لم أستطع جلب صورة جديدة.");
    }
  }
};