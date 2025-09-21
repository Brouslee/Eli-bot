module.exports = {
	config: {
		name: "ح",
		aliases: ["حذف", "مسح"],
		version: "1.2",
		author: "sifo anter",
		countDown: 5,
		role: 0,
		longdescription: {
			vi: "Gỡ tin nhắn của bot",
			en: "Unsend bot's message",
			ar: "مسح رسائل البوت"
		},
		category: "أدوات",
		guide: {
			vi: "reply tin nhắn muốn gỡ của bot và gọi lệnh {pn}",
			en: "reply the message you want to unsend and call the command {pn}",
			ar: "رد على رسالة البوت فقط"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot"
		},
		en: {
			syntaxError: "Please reply the message you want to unsend"
		},
		ar: {
		    syntaxError: "😕 ادخل انت حسابه و امسح"
		}
	},

	onStart: async function ({ message, event, api, getLang }) {
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return message.reply(getLang("syntaxError"));
		message.unsend(event.messageReply.messageID);
	}
};