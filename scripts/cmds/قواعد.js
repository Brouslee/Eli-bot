const { getPrefix } = global.utils;

module.exports = {
	config: {
		name: "قواعد",
		aliases: ["قواعد", "شروط", "قوانين"],
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: { ar: "قوانين المجموعة" },
		longDescription: { ar: "أنشأ/رؤية/اضف/عدل/غيرمكان/احذف قواعد المجموعة" },
		category: "إدارة المجموعة",
		guide: {
			ar: `▸ ◉ طريقة الاستخدام:
│ قواعد [أضف | -a] <القانون>: إضافة قانون جديد
│ قواعد: رؤية قوانين المجموعة
│ قواعد [عدل | -e] <رقم> <النص الجديد>: تعديل قانون محدد
│ قواعد [غيرمكان | -m] <رقم1> <رقم2>: تبديل مكان قانونين
│ قواعد [احذف | -d] <رقم>: حذف قانون محدد
│ قواعد [احذففف | -r]: حذف كل القوانين
│
▸ ◉ مثال:
│ قواعد أضف ممنوع سب البوت
│ قواعد غيرمكان 1 3
│ قواعد احذف 5
│ قواعد احذففف`
		}
	},

	langs: {
		ar: {
			yourRules: `▸ ◉ قواعد المجموعة
│ %1`,
			noRules: `▸ ◉ لا توجد قواعد حالياً
│ أضف قاعدة جديدة باستخدام: %1قواعد أضف [القاعدة]`,
			noPermissionAdd: `▸ ◉ فقط الأدمن يضيف قواعد للمجموعة`,
			noContent: `▸ ◉ يرجى إدخال القاعدة التي تريد إضافتها`,
			success: `▸ ◉ تم إضافة القانون بنجاح`,
			noPermissionEdit: `▸ ◉ أنت لست أدمن`,
			invalidNumber: `▸ ◉ أدخل رقم القاعدة الصحيحة`,
			rulesNotExist: `▸ ◉ القاعدة رقم %1 غير موجودة`,
			numberRules: `▸ ◉ عدد القواعد الحالية: %1`,
			noContentEdit: `▸ ◉ أدخل النص الجديد للقاعدة رقم %1`,
			successEdit: `▸ ◉ تم تعديل القاعدة رقم %1 إلى: %2`,
			noPermissionMove: `▸ ◉ أنت لست أدمن لتغيير مواقع القوانين`,
			invalidNumberMove: `▸ ◉ أدخل رقمين صحيحين لتبديل القوانين`,
			rulesNotExistMove2: `▸ ◉ أحد القوانين %1 أو %2 غير موجود`,
			successMove: `▸ ◉ تم تبديل أماكن القوانين %1 و %2`,
			noPermissionDelete: `▸ ◉ لا يمكنك حذف القوانين`,
			invalidNumberDelete: `▸ ◉ أدخل رقم القاعدة التي تريد حذفها`,
			rulesNotExistDelete: `▸ ◉ القاعدة رقم %1 غير موجودة`,
			successDelete: `▸ ◉ تم حذف القاعدة رقم %1, نصها: %2`,
			noPermissionRemove: `▸ ◉ لا يمكنك حذف كل القوانين`,
			confirmRemove: `▸ ◉ اضغط لتأكيد حذف كل القوانين`,
			successRemove: `▸ ◉ تم حذف كل القوانين بنجاح`,
			invalidNumberView: `▸ ◉ أدخل رقم القاعدة التي تريد رؤيتها`
		}
	},

	onStart: async function ({ role, args, message, event, threadsData, getLang, commandName }) {
		const { threadID, senderID } = event;
		const type = args[0];
		const rulesOfThread = await threadsData.get(threadID, "data.rules", []);
		const totalRules = rulesOfThread.length;

		if (!type) {
			let i = 1;
			const msg = rulesOfThread.reduce((text, rule) => text += `${i++}. ${rule}\n`, "");
			message.reply(msg ? getLang("yourRules", msg) : getLang("noRules", getPrefix(threadID)), (err, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					commandName,
					author: senderID,
					rulesOfThread,
					messageID: info.messageID
				});
			});
		}
		else if (["أضف", "-a"].includes(type)) {
			if (role < 1) return message.reply(getLang("noPermissionAdd"));
			if (!args[1]) return message.reply(getLang("noContent"));
			rulesOfThread.push(args.slice(1).join(" "));
			await threadsData.set(threadID, rulesOfThread, "data.rules");
			message.reply(getLang("success"));
		}
		else if (["عدل", "-e"].includes(type)) {
			if (role < 1) return message.reply(getLang("noPermissionEdit"));
			const stt = parseInt(args[1]);
			if (isNaN(stt)) return message.reply(getLang("invalidNumber"));
			if (!rulesOfThread[stt - 1]) return message.reply(getLang("rulesNotExist", stt));
			if (!args[2]) return message.reply(getLang("noContentEdit", stt));
			const newContent = args.slice(2).join(" ");
			rulesOfThread[stt - 1] = newContent;
			await threadsData.set(threadID, rulesOfThread, "data.rules");
			message.reply(getLang("successEdit", stt, newContent));
		}
		else if (["غيرمكان", "-m"].includes(type)) {
			if (role < 1) return message.reply(getLang("noPermissionMove"));
			const stt1 = parseInt(args[1]), stt2 = parseInt(args[2]);
			if (isNaN(stt1) || isNaN(stt2)) return message.reply(getLang("invalidNumberMove"));
			if (!rulesOfThread[stt1 - 1] || !rulesOfThread[stt2 - 1]) return message.reply(getLang("rulesNotExistMove2", stt1, stt2));
			[rulesOfThread[stt1 - 1], rulesOfThread[stt2 - 1]] = [rulesOfThread[stt2 - 1], rulesOfThread[stt1 - 1]];
			await threadsData.set(threadID, rulesOfThread, "data.rules");
			message.reply(getLang("successMove"));
		}
		else if (["احذف", "del", "-d"].includes(type)) {
			if (role < 1) return message.reply(getLang("noPermissionDelete"));
			if (!args[1] || isNaN(args[1])) return message.reply(getLang("invalidNumberDelete"));
			const rulesDel = rulesOfThread[parseInt(args[1]) - 1];
			if (!rulesDel) return message.reply(getLang("rulesNotExistDelete", args[1]));
			rulesOfThread.splice(parseInt(args[1]) - 1, 1);
			await threadsData.set(threadID, rulesOfThread, "data.rules");
			message.reply(getLang("successDelete", args[1], rulesDel));
		}
		else if (["احذففف", "reset", "-r", "-rm"].includes(type)) {
			if (role < 1) return message.reply(getLang("noPermissionRemove"));
			message.reply(getLang("confirmRemove"), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					commandName: "rules",
					messageID: info.messageID,
					author: senderID
				});
			});
		}
		else if (!isNaN(type)) {
			let msg = "";
			for (const stt of args) {
				const rules = rulesOfThread[parseInt(stt) - 1];
				if (rules) msg += `${stt}. ${rules}\n`;
			}
			if (!msg) return message.reply(getLang("rulesNotExist", type));
			message.reply(msg);
		}
		else message.SyntaxError();
	},

	onReply: async function ({ message, event, getLang, Reply }) {
		const { author, rulesOfThread } = Reply;
		if (author != event.senderID) return;
		const num = parseInt(event.body || "");
		if (isNaN(num) || num < 1) return message.reply(getLang("invalidNumberView"));
		if (num > rulesOfThread.length) return message.reply(getLang("rulesNotExist", num));
		message.reply(`${num}. ${rulesOfThread[num - 1]}`, () => message.unsend(Reply.messageID));
	},

	onReaction: async function ({ threadsData, message, Reaction, event, getLang }) {
		if (Reaction.author != event.userID) return;
		await threadsData.set(event.threadID, [], "data.rules");
		message.reply(getLang("successRemove"));
	}
};