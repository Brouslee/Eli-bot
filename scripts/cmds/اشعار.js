const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "إشعار",
    aliases: ["notify", "noti"],
    version: "1.9",
    author: "NTKhang / Aesther",
    countdown: 5,
    role: 2,
    shortDescription: "▸ ◉ إرسال إشعار من المطور إلى كل المجموعات",
    longDescription: "▸ ◉ إرسال إشعار إلى جميع المجموعات مع دعم المرفقات",
    category: "إدارة البوت",
    guide: {
      ar: "{pn} <رسالة>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    ar: {
      missingMessage: "▸ ◉ الرجاء إدخال الرسالة التي تريد إرسالها إلى باقي المجموعات",
      notification: "▸ ◉ 【المطور】",
      sendingNotification: "▸ ◉ جاري إرسال الرسائل إلى %1 من المجموعات، يرجى الانتظار...",
      sentNotification: "▸ ◉ تم إرسال الإشعار إلى %1 من المجموعات بنجاح",
      errorSendingNotification: "▸ ◉ حدث خطأ أثناء إرسال الإشعار إلى %1 من المجموعات:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0]) return message.reply(getLang("missingMessage"));

    const formSend = {
      body: `${getLang("notification")}\n─────────────────\n✏ ${args.join(" ")}\n─────────────────\n━「 ايلي - Eli 」━`,
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item =>
          ["photo", "png", "animated_image", "video", "audio"].includes(item.type)
        )
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(
      t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );

    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    for (const thread of allThreadID) {
      try {
        waitingSend.push({
          threadID: thread.threadID,
          pending: api.sendMessage(formSend, thread.threadID)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (e) {
        sendError.push(thread.threadID);
      }
    }

    for (const sended of waitingSend) {
      try {
        await sended.pending;
        sendSuccess++;
      } catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription))
          sendError.push({ threadIDs: [sended.threadID], errorDescription });
        else
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }

    let msg = "";
    if (sendSuccess > 0) msg += getLang("sentNotification", sendSuccess) + "\n";
    if (sendError.length > 0)
      msg += getLang(
        "errorSendingNotification",
        sendError.reduce((a, b) => a + b.threadIDs.length, 0),
        sendError.reduce(
          (a, b) => a + `\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`,
          ""
        )
      );

    message.reply(msg);
  }
};