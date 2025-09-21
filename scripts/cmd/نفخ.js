module.exports = {
	config: {
		name: "نفخ",
		aliases: ["اطرد","خرجو"],
		version: "1.3",
		author: "sifo anter",
		countDown: 5,
		role: 1,
		description: {
			ar: "▸ طرد الأعضاء من المجموعة",
		},
		category: "إدارة المجموعة",
		guide: {
			ar: `▸ استخدام الأمر:
│ • {pn} @تاغ لمن تريد طردهم
│   يطرد كل من في التاغ إذا كان البوت أدمن
▸ ملاحظات:
│ • يجب أن يكون البوت أدمن في المجموعة
│ • يمكن طرد أكثر من شخص بالتاغ`
		}
	},

	langs: {
		ar: {
		    needAdmin: "▸ يجب أن يكون البوت أدمن ليتمكن من طرد الأعضاء"
		}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			}
			catch (e) {
				message.reply(getLang("needAdmin"));
				return "ERROR";
			}
		}

		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			await kickAndCheckError(event.messageReply.senderID);
		}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.SyntaxError();
			if (await kickAndCheckError(uids.shift()) === "ERROR")
				return;
			for (const uid of uids)
				api.removeUserFromGroup(uid, event.threadID);
		}
	}
};