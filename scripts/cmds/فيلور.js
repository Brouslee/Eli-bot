module.exports = {
  config: {
    name: "فيلور",
    aliases: ['ap'],
    version: "1.0",
    author: "Loid Butter",
    role: 2,
    shortDescription: {
      ar: "تعيين فيلور لمستخدم"
    },
    longDescription: {
      ar: "تعيين كمية فيلور لمستخدم كما تريد"
    },
    category: "اقتصاد",
    guide: {
      ar: "{pn} تعيين [الكمية]"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const permission = ["100087632392287"];
    if (!permission.includes(event.senderID)) {
      api.sendMessage("ليس لديك صلاحية لاستخدام هذا الأمر. فقط سيدي يستطيع استخدامه.", event.threadID, event.messageID);
      return;
    }

    const amount = parseInt(args[0]);
    if (!amount) {
      return api.sendMessage("أمر غير صالح. الاستخدام: تعيين [الكمية]", event.threadID);
    }

    const { senderID, threadID } = event;
    if (senderID === api.getCurrentUserID()) return;

    let targetUser;
    if (event.type === "message_reply") {
      targetUser = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      targetUser = mention[0] || senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage("المستخدم غير موجود.", threadID);
    }

    const name = await usersData.getName(targetUser);

    await usersData.set(targetUser, {
      money: amount,
      exp: userData.exp,
      data: userData.data
    });

    return api.sendMessage(`تم تعيين ${amount} فيلور لـ ${name}.`, threadID);
  }
};