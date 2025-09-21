const axios = require("axios");
const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "ثريدز",
    aliases: [],
    version: "1.2",
    author: "Kshitiz",
    countDown: 5,
    role: 0,
    shortDescription: "▸ ◉ قم بإرسال رسالة أو الانضمام لمجموعة",
    longDescription: "▸ ◉ إرسال رسالة لمجموعة معينة أو الانضمام لمجموعة مباشرة من القائمة",
    category: "إدارة البوت",
    guide: {
      ar: "{pn} <الرسالة> [آيدي] أو الرد على قائمة المجموعات بـ -<رقم>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    // رد على رقم المجموعة للانضمام
    if (event.type === "message_reply" && /^-\d+$/.test(event.body.trim())) {
      const groupNumber = parseInt(event.body.trim().slice(1)) - 1;
      const groupList = (await api.getThreadList(100, null, ['INBOX'])).filter(g => g.threadName !== null);
      if (groupList[groupNumber]) {
        await api.addUserToGroup(event.senderID, groupList[groupNumber].threadID);
        return api.sendMessage(`▸ ◉ ✅ تم إضافتك إلى المجموعة: ${groupList[groupNumber].threadName}`, event.threadID);
      } else {
        return api.sendMessage("▸ ◉ ⚠️ الرقم غير صحيح", event.threadID);
      }
    }

    if (!args[0]) {
      try {
        const groupList = await api.getThreadList(100, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (filteredList.length === 0) {
          return api.sendMessage('▸ ◉ ⚠️ لم يتم العثور على أي مجموعة', event.threadID);
        }

        const formattedList = filteredList.map((group, index) =>
          `│ ${index + 1}. ${group.threadName}\n│ آيدي المجموعة: ${group.threadID}  (رد بـ -${index + 1} للانضمام)`
        );

        return api.sendMessage(`▸ ◉ قائمة المجموعات:\n${formattedList.join("\n")}`, event.threadID, event.messageID);
      } catch (error) {
        console.error("خطأ في جلب قائمة المجموعات", error);
      }
      return;
    }

    const messageText = args.slice(0, -1).join(" ");
    const gcUid = args.length >= 2 ? args[args.length - 1] : null;
    const groupChats = gcUid ? [gcUid] : (await api.getThreadList(100, null, ["INBOX"])).map(group => group.threadID);

    try {
      const attachments = await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
      );

      for (const groupChat of groupChats) {
        await api.sendMessage({
          body: messageText,
          attachment: attachments.length > 0 ? attachments : null
        }, groupChat);
      }

      api.sendMessage(`▸ ◉ تم إرسال الإشعار إلى ${gcUid ? "المجموعة " + gcUid : "كل المجموعات"}`, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage(`▸ ◉ كيفية الاستخدام\n│ قم بالرد على صورة أو فيديو واكتب الرسالة بعدها مع آيدي المجموعة`, event.threadID, event.messageID);
      console.error(error);
    }
  }
};