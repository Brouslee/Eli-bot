module.exports = {
  config: {
    name: "همسة",
    aliases: ["pm", "رسالة_سرية"],
    version: "1.0",
    author: "luffy",
    countDown: 5,
    role: 2,
    shortDescription: { ar: "إرسال رسالة سرية لمستخدم" },
    longDescription: { ar: "يمكنك إرسال رسالة سرية باستخدام رقم المحادثة أو معرف المستخدم" },
    category: "محادثة",
    guide: { ar: "{p}همسة معرف_المستخدم نص_الرسالة" }
  },

  onStart: async function ({ api, event, args }) {
    if (args.length < 2) {
      return api.sendMessage(
        "▸ ◉ خطأ في الصياغة\n│ استخدم: همسة معرف_المستخدم نص_الرسالة",
        event.threadID,
        event.messageID
      );
    }

    const idBox = args[0];
    const message = args.slice(1).join(" ");

    api.sendMessage({
      body: message,
      mentions: [{
        tag: "@المُرسل",
        id: event.senderID
      }]
    }, idBox, () => {
      api.sendMessage(
        `▸ ◉ تم إرسال الرسالة بنجاح\n│ الرسالة: "${message}"\n│ تم الإرسال بشكل سري إلى: ${idBox}`,
        event.threadID
      );
    });
  }
};