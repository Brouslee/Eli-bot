module.exports = {
  config: {
    name: "تحويل",
    version: "1.3",
    author: "Hassan + gpt",
    role: 0,
    countdown: 10,
    category: "إقتصاد",
    shortDescription: { ar: "💸 إرسال المال لمستخدم عن طريق الرد أو التاغ" },
    longDescription: { ar: "💰 أمر لإرسال المال لمستخدم آخر بالرد على رسالته أو من خلال منشن" },
    guide: { ar: "{prefix}تحويل <المبلغ> - رد على رسالة أو منشن الشخص لتحويل المال له" }
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const { senderID, messageReply, mentions } = event;
    const senderData = await usersData.get(senderID);
    if (!senderData) return message.reply("❌ | بياناتك مش موجودة");

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) return message.reply("⚠️ | حدد مبلغ صحيح");
    if (amount > senderData.money) return message.reply("⚠️ | رصيدك غير كافي 💸");

    let recipientID;
    if (messageReply && messageReply.senderID) recipientID = messageReply.senderID;
    else if (mentions && Object.keys(mentions).length > 0) recipientID = Object.keys(mentions)[0];
    else return message.reply("❌ | رد على رسالة أو منشن الشخص اللي تحب تحول له المال");

    const recipientData = await usersData.get(recipientID);
    if (!recipientData) return message.reply("❌ | ما لقيت المستقبل 👤");

    await usersData.set(senderID, { money: senderData.money - amount, data: senderData.data });
    await usersData.set(recipientID, { money: (recipientData.money || 0) + amount, data: recipientData.data });

    const successMsg =
`▸ ✅ | تم تحويل 💵 ${amount}  
│ إلى الشخص اللي رديت على رسالته أو منشنته  
▸ استمر ووزع ثروتك 😎`;

    message.reply(successMsg);
  }
};