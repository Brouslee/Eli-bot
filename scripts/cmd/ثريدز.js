module.exports = {
  config: {
    name: "جيلالي",
    aliases: [],
    version: "1.0",
    author: "R3D",
    countDown: 5,
    role: 2,
    shortDescription: {
      ar: "عرض القروبات واضافة نفسك"
    },
    category: "admin",
    guide: {
      ar: "{pn} \n{pn} ضيفني <رقم>"
    }
  },

  onStart: async function ({ api, event, args, threadsData, message }) {
    const allThreads = await threadsData.getAll();

    if (args[0] && args[0].toLowerCase() === "ضيفني") {
      const index = parseInt(args[1]) - 1;
      if (isNaN(index) || index < 0 || index >= allThreads.length) {
        return message.reply("❌ الرقم غير صحيح.");
      }

      const thread = allThreads[index];
      try {
        await api.addUserToGroup(event.senderID, thread.threadID);
        return message.reply(`✅ تمت إضافتك إلى القروب: ${thread.threadName || thread.threadID}`);
      } catch (e) {
        return message.reply(`❌ ما قدرت أضيفك: ${e.message}`);
      }
    }

    if (!allThreads || allThreads.length === 0) {
      return message.reply("ما في ولا قروب حالياً 😶");
    }

    let replyMsg = "📋 قائمة القروبات الحالية:\n\n";
    allThreads.forEach((thread, i) => {
      replyMsg += `${i + 1}. ${thread.threadName || "بدون اسم"}\n`;
    });

    replyMsg += `\nاكتب: ${global.GoatBot.config.prefix}جيلالي ضيفني <رقم>`;
    message.reply(replyMsg);
  }
};