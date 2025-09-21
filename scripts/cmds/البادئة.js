const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "البادئة",
		aliases: ["px", "رمز"],
		version: "1.4",
		author: "sifo anter",
		countDown: 5,
		role: 2,
		longdescription: "تعديل رمز البوت في المجموعات.",
		category: "المطور",
		guide: {
			ar: `▸ ▸ ▸ كيفية استخدام الأوامر:
│ • {pn} <البادئة الجديدة> : تغيير البادئة في مجموعتك
│   مثال: {pn} #
▸ ▸ لتغيير البادئة في النظام (للأدمن فقط):
│ • {pn} <البادئة الجديدة> -g
│   مثال: {pn} # -g
▸ ▸ لإعادة البادئة إلى الافتراضي:
│ • {pn} reset`
		}
	},

	langs: {
		ar: {
			reset: "▸ ✅ تم إعادة البادئة إلى الافتراضي │ %1",
			onlyAdmin: "▸ ❌ فقط الأدمن يمكنه تغيير البادئة في النظام",
			confirmGlobal: "▸ ⚠️ ضع رد على هذه الرسالة لتأكيد تغيير البادئة للنظام بالكامل",
			confirmThisThread: "▸ ⚠️ ضع رد على هذه الرسالة لتأكيد تغيير البادئة في مجموعتك",
			successGlobal: "▸ ✅ تم تغيير البادئة للنظام │ %1",
			successThisThread: "▸ ✅ تم تغيير البادئة في مجموعتك │ %1",
			myPrefix: "▸ 🌐 بادئة النظام: %1\n▸ 🛸 بادئة مجموعتك: %2"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0]) return message.SyntaxError();

		if (args[0] === 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = { commandName, author: event.senderID, newPrefix };

		if (args[1] === "-g") {
			if (role < 2) return message.reply(getLang("onlyAdmin"));
			formSet.setGlobal = true;
		} else formSet.setGlobal = false;

		return message.reply(
			args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), 
			(err, info) => {
				formSet.messageID = info.messageID;
				global.GoatBot.onReaction.set(info.messageID, formSet);
			}
		);
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && ["prefix", "الرمز"].includes(event.body.toLowerCase()))
			return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)));
	}
};