const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ريلوود",
    aliases: ["ريستارت", "ريلود", "reload"],
    version: "1.2.1",
    author: "NTKhang | Modified by SIFO ANTER",
    role: 2,
    shortDescription: { ar: "إعادة تشغيل البوت" },
    longDescription: { ar: "يعيد تشغيل البوت مع رسالة تأكيد بعد التشغيل" },
    category: "المطور",
    guide: { ar: "{pn}: لإعادة تشغيل البوت" }
  },

  langs: {
    ar: {
      restarting: "▸ ◉ جارٍ إعادة تشغيل البوت...\n│ يرجى الانتظار قليلًا",
      restarted: "▸ ◉ تمت إعادة التشغيل بنجاح\n│ المدة: {duration} ثانية\n│ البوت جاهز الآن"
    }
  },

  onLoad: function ({ api }) {
    try {
      const tmpDir = path.join(__dirname, "tmp");
      const pathFile = path.join(tmpDir, "restart.json");

      if (!fs.existsSync(pathFile))
        return;

      const data = fs.readJsonSync(pathFile);
      const duration = ((Date.now() - Number(data.time)) / 1000).toFixed(2);
      const messageText = String(data.template || "تمت إعادة التشغيل خلال {duration} ثانية")
        .replace("{duration}", duration);

      if (data.mid) {
        try {
          api.editMessage(messageText, data.mid);
        } catch (e) {
          if (data.tid)
            api.sendMessage(messageText, data.tid);
        }
      } else if (data.tid) {
        api.sendMessage(messageText, data.tid);
      }

      fs.unlinkSync(pathFile);
    } catch (e) { /* ignore */ }
  },

  onStart: async function ({ message, event, getLang }) {
    const tmpDir = path.join(__dirname, "tmp");
    const pathFile = path.join(tmpDir, "restart.json");

    await fs.ensureDir(tmpDir);

    const sent = await message.reply(getLang("restarting"));

    const template = (typeof getLang("restarted") === "string")
      ? getLang("restarted")
      : "▸ ◉ تمت إعادة التشغيل بنجاح\n│ المدة: {duration} ثانية\n│ البوت جاهز الآن";

    await fs.writeJson(pathFile, {
      tid: event.threadID,
      mid: sent.messageID,
      time: Date.now(),
      template
    });

    setTimeout(() => process.exit(2), 1000);
  }
};