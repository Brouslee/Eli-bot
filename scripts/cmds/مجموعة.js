const fs = require("fs-extra");

const banFile = __dirname + "/cache/banGroups.json";

function loadBans() {
  if (!fs.existsSync(banFile)) return {};
  return JSON.parse(fs.readFileSync(banFile));
}

function saveBans(data) {
  fs.writeFileSync(banFile, JSON.stringify(data, null, 2));
}

const warnedGroups = {};

module.exports = {
  config: {
    name: "مجموعة",
    aliases: ["groupban"],
    version: "1.5",
    author: "SIFOANTER",
    countDown: 5,
    role: 2,
    shortDescription: "إدارة المجموعات المحظورة",
    longDescription: "حظر وإلغاء حظر المجموعات + عرض القائمة مع الأسماء والسبب + فلتر للبوت داخل المجموعات المحظورة",
    category: "أدوات",
    guide: {
      en: "{p}مجموعة [إضافة <آيدي> <سبب>] | [حذف <آيدي>] | [قائمة]"
    }
  },

  onStart: async function ({ api, event, args }) {
    let bans = loadBans();
    let threadID = event.threadID;

    if (!args[0]) {
      return api.sendMessage(
        "▸ ◉ أوامر الحظر:\n│ إضافة <آيدي> <سبب>\n│ حذف <آيدي>\n│ قائمة",
        threadID,
        event.messageID
      );
    }

    let action = args[0].toLowerCase();

    // إضافة
    if (action === "إضافة") {
      let id = args[1] || threadID;
      let reason = args.slice(2).join(" ") || "بدون سبب محدد";
      if (bans[id]) {
        return api.sendMessage(`▸ ◉ المجموعة محظورة مسبقًا\n│ الاسم: ${bans[id].name}\n│ السبب: ${bans[id].reason}`, threadID, event.messageID);
      }
      try {
        const info = await api.getThreadInfo(id);
        bans[id] = { name: info.threadName, reason };
        saveBans(bans);
        return api.sendMessage(
          `▸ ◉ تم حظر المجموعة\n│ الاسم: ${info.threadName}\n│ الآيدي: ${id}\n│ السبب: ${reason}`,
          threadID,
          event.messageID
        );
      } catch (err) {
        return api.sendMessage("❌ لم أتمكن من الوصول إلى هذه المجموعة", threadID, event.messageID);
      }
    }

    // حذف
    if (action === "حذف") {
      let id = args[1] || threadID;
      if (!bans[id]) {
        return api.sendMessage("▸ ◉ هذه المجموعة غير محظورة", threadID, event.messageID);
      }
      const groupName = bans[id].name;
      delete bans[id];
      saveBans(bans);
      if (warnedGroups[id]) delete warnedGroups[id];
      return api.sendMessage(
        `▸ ◉ تم إلغاء الحظر\n│ الاسم: ${groupName}\n│ الآيدي: ${id}`,
        threadID,
        event.messageID
      );
    }

    // قائمة
    if (action === "قائمة") {
      let list = Object.keys(bans);
      if (list.length === 0) {
        return api.sendMessage("▸ ◉ لا توجد مجموعات محظورة", threadID, event.messageID);
      }
      let msg = "▸ ◉ قائمة المجموعات المحظورة:\n";
      list.forEach((id, i) => {
        msg += `│ ${i + 1}. ${bans[id].name} - ${id}\n│ السبب: ${bans[id].reason}\n`;
      });
      return api.sendMessage(msg, threadID, event.messageID);
    }
  },

  onMessage: async function ({ event, api }) {
    const bans = loadBans();
    const threadID = event.threadID;
    if (bans[threadID]) {
      if (!warnedGroups[threadID]) {
        warnedGroups[threadID] = true;
        return api.sendMessage(
          `▸ ◉ هذه المجموعة محظورة\n│ الاسم: "${bans[threadID].name}"\n│ السبب: ${bans[threadID].reason}\n▸ البوت لن يرد إلا بعد رفع الحظر`,
          threadID
        );
      }
      return false;
    }
  }
};