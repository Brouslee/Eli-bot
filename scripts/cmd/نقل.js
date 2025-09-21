module.exports = {
  config: {
    name: "نقل",
    aliases: [],
    author: "kshitiz",
    version: "2.0",
    cooldowns: 5,
    role: 2,
    shortDescription: { ar: "نقل جميع أعضاء الدردشة إلى supportgc" },
    longDescription: { ar: "ينقل جميع أعضاء الدردشة الجماعية إلى مجموعة الدعم المحددة" },
    category: "المطور",
    guide: { ar: "{p}{n}" }
  },

  onStart: async function ({ api, args, message, event }) {
    const permission = ["100087632392287", "100090138577417"];
    const supportGroupId = "2034151100736543"; // معرف مجموعة الدعم
    const threadID = event.threadID;

    if (!permission.includes(event.senderID)) {
      return api.sendMessage(
        "▸ ◉ آسف سيدي\n│ لا يمكنك استخدام هذا الأمر.",
        threadID,
        event.messageID
      );
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    api.sendMessage("▸ ◉ جارٍ تنفيذ الأمر...\n│ يرجى الانتظار قليلاً", threadID, event.messageID);

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs;

      let chunkSize = 20; // تقسيم الأعضاء إلى مجموعات من 20
      for (let i = 0; i < participantIDs.length; i += chunkSize) {
        const chunk = participantIDs.slice(i, i + chunkSize);

        for (const memberID of chunk) {
          const supportThreadInfo = await api.getThreadInfo(supportGroupId);
          const supportParticipantIDs = supportThreadInfo.participantIDs;

          if (!supportParticipantIDs.includes(memberID)) {
            api.addUserToGroup(memberID, supportGroupId, (err) => {
              if (err) {
                console.error(`▸ ❌ | فشل نقل العضو ${memberID}:`, err);
              } else {
                console.log(`▸ ✅ | العضو ${memberID} تم نقله بنجاح.`);
              }
            });
          }
        }

        // تأخير لمدة 5 ثواني بين المجموعات لتجنب تجاوز الـ rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      api.sendMessage(
        "▸ ◉ تمت العملية بنجاح\n│ كل الأعضاء تم نقلهم إلى مجموعة الدعم\n│ تحققوا من رسائل المجموعة الجديدة.",
        threadID
      );
    } catch (err) {
      api.sendMessage(
        `▸ ❌ | حدث خطأ أثناء النقل:\n│ ${err.message}`,
        threadID
      );
    }
  }
};