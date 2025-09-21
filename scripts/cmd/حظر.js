module.exports = {
  config: {
    name: "حظر",
    aliases: ["ban", "block"],
    version: "1.2",
    author: "sifo anter + GPT",
    countDown: 5,
    role: 1,
    shortDescription: {
      ar: "حظر أو إلغاء حظر عضو من المجموعة"
    },
    category: "الإدارة",
    guide: {
      ar: "{pn} @العضو: لحظر العضو\n{pn} unban @العضو: لإلغاء الحظر\n{pn} list: عرض قائمة المحظورين"
    }
  },

  langs: {
    ar: {
      banning: "▸ ◉ جارٍ حظر %1...\n│ يرجى الانتظار قليلًا",
      banned: "▸ ◉ تم حظر %1 من المجموعة\n│ السبب: %2\n│ الوقت: %3",
      selfBan: "▸ ◉ لا يمكنك حظر نفسك!\n│ حاول مع عضو آخر",
      banAdmin: "▸ ◉ لا يمكنك حظر المسؤول!\n│ الصلاحيات لا تسمح",
      alreadyBanned: "▸ ◉ العضو %1 محظور من قبل\n│ السبب: %2\n│ الوقت: %3",
      unbanned: "▸ ◉ تم إلغاء حظر %1 بنجاح\n│ يمكنه الآن العودة للمجموعة",
      unbanning: "▸ ◉ جارٍ إلغاء حظر %1...\n│ يرجى الانتظار قليلًا",
      notBanned: "▸ ◉ العضو %1 ليس محظورًا\n│ تحقق من المعرف: %2",
      noBanned: "▸ ◉ لا توجد أي حالات حظر\n│ القائمة فارغة تمامًا",
      listBanned: "▸ ◉ قائمة الأعضاء المحظورين\n│ الصفحة: %1/%2\n│ التفاصيل بالأسفل\n\n%3"
    }
  },

  onStart: async function ({ message, args, event, api, usersData, getLang }) {
    const { threadID, senderID, mentions } = event;
    const command = args[0];

    // قاعدة بيانات محلية مبسطة
    const fs = require("fs");
    const path = require("path");
    const dbPath = path.join(__dirname, "banned.json");

    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "{}");
    const bannedDB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    function saveDB() {
      fs.writeFileSync(dbPath, JSON.stringify(bannedDB, null, 2));
    }

    if (command === "list") {
      const bannedList = Object.keys(bannedDB);
      if (bannedList.length === 0) return message.reply(getLang("noBanned"));

      let page = parseInt(args[1]) || 1;
      const perPage = 5;
      const totalPage = Math.ceil(bannedList.length / perPage);

      if (page > totalPage) page = totalPage;

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const slice = bannedList.slice(start, end);

      const details = slice
        .map(
          (uid, i) =>
            `▸ ${i + 1}. ${bannedDB[uid].name} (${uid})\n│ السبب: ${bannedDB[uid].reason}\n│ الوقت: ${bannedDB[uid].time}`
        )
        .join("\n\n");

      return message.reply(getLang("listBanned", page, totalPage, details));
    }

    if (command === "unban") {
      const mentionID = Object.keys(mentions)[0];
      if (!mentionID) return message.reply("▸ ◉ لازم تحدد عضو لفك الحظر");

      if (!bannedDB[mentionID])
        return message.reply(getLang("notBanned", mentions[mentionID], mentionID));

      message.reply(getLang("unbanning", mentions[mentionID]), () => {
        delete bannedDB[mentionID];
        saveDB();
        message.reply(getLang("unbanned", mentions[mentionID]));
      });
      return;
    }

    // أمر الحظر
    const mentionID = Object.keys(mentions)[0];
    if (!mentionID) return message.reply("▸ ◉ لازم تحدد عضو لحظره");

    if (mentionID === senderID) return message.reply(getLang("selfBan"));

    // نمنع حظر الادمن
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(a => a.id === mentionID);
    if (isAdmin) return message.reply(getLang("banAdmin"));

    if (bannedDB[mentionID]) {
      return message.reply(
        getLang(
          "alreadyBanned",
          mentions[mentionID],
          bannedDB[mentionID].reason,
          bannedDB[mentionID].time
        )
      );
    }

    const reason = args.slice(1).join(" ") || "بدون سبب";
    const time = new Date().toLocaleString("ar-EG");

    message.reply(getLang("banning", mentions[mentionID]), () => {
      bannedDB[mentionID] = {
        name: mentions[mentionID],
        reason,
        time
      };
      saveDB();
      message.reply(getLang("banned", mentions[mentionID], reason, time));
      api.removeUserFromGroup(mentionID, threadID);
    });
  }
};