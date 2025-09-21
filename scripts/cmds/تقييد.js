const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "النظام",
    aliases: ["devonly", "onlydev", "للمطورين", "المطورفقط"],
    version: "1.9",
    author: "SIFOANTER + gpt",
    countDown: 5,
    role: 2,
    shortDescription: {
      ar: "تفعيل/تعطيل الوضع للمطور أو للجميع",
      en: "turn on/off dev only or for everyone"
    },
    category: "المطور",
    guide: {
      ar:
        " {pn} تشغيل: تفعيل البوت للجميع" +
        "\n {pn} إيقاف: تفعيل البوت للمطور فقط",
      en:
        " {pn} تشغيل: turn on bot for everyone" +
        "\n {pn} إيقاف: turn on bot for dev only"
    }
  },

  langs: {
    ar: {
      starting: "▸ ◉ جاري تغيير وضع البوت...\n│ يرجى الانتظار قليلًا",
      everyone: "▸ ◉ تم تفعيل البوت لجميع المستخدمين\n│ البوت جاهز الآن",
      devOnly: "▸ ◉ تم تفعيل البوت للمطور فقط\n│ البوت جاهز الآن"
    },
    en: {
      starting: "▸ ◉ Changing bot mode...\n│ Please wait a moment",
      everyone: "▸ ◉ Bot enabled for everyone\n│ Bot is ready",
      devOnly: "▸ ◉ Bot enabled for dev only\n│ Bot is ready"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    const command = args[0]?.toLowerCase();

    message.reply(getLang("starting"));

    if (command === "تشغيل") {
      config.adminOnly = false;
      message.reply(getLang("everyone"));
    } else if (command === "ايقاف" || command === "إيقاف") {
      config.adminOnly = true;
      message.reply(getLang("devOnly"));
    } else {
      return message.SyntaxError();
    }

    try {
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
    } catch (e) {
      console.error("❌ فشل حفظ الإعدادات في ملف config:", e.message);
    }
  }
};