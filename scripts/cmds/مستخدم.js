const { getTime } = global.utils;

module.exports = {
	config: {
		name: "مستخدم",
		aliases: ["مس", "مستخدم"],
		version: "1.5",
		author: "sifo anter",
		countDown: 5,
		role: 2,
		longdescription: {
			ar: "حظر أو فك حظر شخص وإدارة المستخدمين"
		},
		category: "إدارة البوت",
		guide: {
			ar: "   {pn} [ابحث | -f | بحث | -s] <الاسم>: البحث عن مستخدم\n"
				+ "   {pn} [حظر | -b] <معرف المستخدم> <سبب>: لحظر مستخدم\n"
				+ "   {pn} [فك | -u] <معرف المستخدم>: لإلغاء حظر مستخدم"
		}
	},

	langs: {
		ar: {
			userBannedAlert:
`▸ ◉ مستخدم محظور
│ الاسم: %1
│ الآيدي: %2
│ السبب: %3
│ التاريخ: %4
│ ⚠️ لا يمكنك استخدام البوت حالياً`,
			noUserFound: "❌ لم يتم العثور على مستخدم بالاسم: \"%1\"",
			userFound: "▸ ◉ تم العثور على %1 مستخدم مطابقة:\n%2",
			uidRequired: "⚠️ يرجى إدخال معرف المستخدم أو الرد على رسالة أو وسم",
			reasonRequired: "⚠️ يرجى إدخال سبب الحظر",
			userHasBanned: "▸ ◉ المستخدم [%1 | %2] محظور سابقًا\n│ السبب: %3\n│ التاريخ: %4",
			userBanned: "▸ ◉ تم حظر المستخدم [%1 | %2]\n│ السبب: %3\n│ التاريخ: %4",
			uidRequiredUnban: "⚠️ يرجى إدخال معرف المستخدم لإلغاء الحظر",
			userNotBanned: "▸ ◉ المستخدم [%1 | %2] غير محظور",
			userUnbanned: "▸ ◉ تم إلغاء حظر المستخدم [%1 | %2]"
		}
	},

	onStart: async function ({ args, usersData, message, event, getLang }) {
		// تحقق أولاً إذا المستخدم محظور
		const currentUser = await usersData.get(event.senderID);
		if (currentUser.banned && currentUser.banned.status) {
			const alertMsg = getLang("userBannedAlert",
				currentUser.name,
				event.senderID,
				currentUser.banned.reason,
				currentUser.banned.date
			);
			return message.reply(alertMsg);
		}

		const type = args[0];
		switch (type) {
			// البحث
			case "بحث":
			case "find":
			case "-f":
			case "search":
			case "-s": {
				const allUser = await usersData.getAll();
				const keyWord = args.slice(1).join(" ");
				const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
				const msg = result.reduce((i, user) => i += `│ الاسم: ${user.name}\n│ الآيدي: ${user.userID}\n`, "");
				message.reply(result.length == 0 ? getLang("noUserFound", keyWord) : getLang("userFound", result.length, msg));
				break;
			}

			// الحظر
			case "بان":
			case "حظر":
			case "حضر":
			case "ban":
			case "-b": {
				let uid, reason;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
					reason = args.slice(1).join(" ");
				} else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
					reason = args.slice(1).join(" ").replace(mentions[uid], "");
				} else if (args[1]) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				} else return message.SyntaxError();

				if (!uid) return message.reply(getLang("uidRequired"));
				if (!reason) return message.reply(getLang("reasonRequired"));

				const userData = await usersData.get(uid);
				const name = userData.name;
				if (userData.banned && userData.banned.status) return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));

				const time = getTime("DD/MM/YYYY HH:mm:ss");
				await usersData.set(uid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});
				message.reply(getLang("userBanned", uid, name, reason, time));
				break;
			}

			// فك الحظر
			case "فك":
			case "unban":
			case "-u": {
				let uid;
				if (event.type == "message_reply") uid = event.messageReply.senderID;
				else if (Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
				else if (args[1]) uid = args[1];
				else return message.SyntaxError();

				if (!uid) return message.reply(getLang("uidRequiredUnban"));
				const userData = await usersData.get(uid);
				const name = userData.name;
				if (!userData.banned || !userData.banned.status) return message.reply(getLang("userNotBanned", uid, name));

				await usersData.set(uid, { banned: {} });
				message.reply(getLang("userUnbanned", uid, name));
				break;
			}

			default:
				return message.SyntaxError();
		}
	}
};