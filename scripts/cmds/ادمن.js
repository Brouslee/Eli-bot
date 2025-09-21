const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "مشرفين",
		aliases: ["و", "مشرفين", "ادمن"],
		version: "1.6",
		author: "SIFOANTER",
		countDown: 5,
		role: 2,
		shortDescription: {
			ar: "▸ ◉ إضافة، حذف أو تعديل صلاحيات الأدمن"
		},
		category: "إدارة البوت",
		guide: {
			ar: '▸ ◉ دليل الاستخدام\n│ إضافة: {pn} إضافة <UID أو @tag>\n│ حذف: {pn} حذف <UID أو @tag>\n│ قائمة: {pn} قائمة'
		}
	},

	langs: {
		ar: {
			added: "▸ ◉ تم الإضافة بنجاح\n│ عدد المستخدمين: %1\n%2",
			alreadyAdmin: "▸ ◉ بالفعل أدمن\n│ عدد المستخدمين: %1\n%2",
			missingIdAdd: "▸ ◉ خطأ\n│ الرجاء إدخال UID أو منشن لإعطاء صلاحية الأدمن",
			removed: "▸ ◉ تم الإزالة بنجاح\n│ عدد المستخدمين: %1\n%2",
			notAdmin: "▸ ◉ خطأ\n│ المستخدمين الذين لا يملكون صلاحية أدمن: %1\n%2",
			missingIdRemove: "▸ ◉ خطأ\n│ الرجاء إدخال UID أو منشن لإزالة صلاحية الأدمن",
			listAdmin: "▸ ◉ قائمة الأدمنز:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const cmd = args[0]?.toLowerCase();
		switch (cmd) {
			case "add":
			case "-a":
			case "إضافة": {
				if (!args[1]) return message.reply(getLang("missingIdAdd"));
				let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) :
					event.messageReply ? [event.messageReply.senderID] : args.filter(arg => !isNaN(arg));

				const notAdminIds = [], adminIds = [];
				for (const uid of uids) {
					if (config.adminBot.includes(uid)) adminIds.push(uid);
					else notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);
				const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length,
						getNames.filter(({ uid }) => notAdminIds.includes(uid))
							.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "") +
					(adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length,
						getNames.filter(({ uid }) => adminIds.includes(uid))
							.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
				);
			}

			case "remove":
			case "-r":
			case "حذف":
			case "إزالة": {
				if (!args[1]) return message.reply(getLang("missingIdRemove"));
				let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : args.filter(arg => !isNaN(arg));

				const notAdminIds = [], adminIds = [];
				for (const uid of uids) {
					if (config.adminBot.includes(uid)) adminIds.push(uid);
					else notAdminIds.push(uid);
				}

				for (const uid of adminIds) config.adminBot.splice(config.adminBot.indexOf(uid), 1);
				const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(adminIds.length > 0 ? getLang("removed", adminIds.length,
						getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "") +
					(notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length,
						notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}

			case "list":
			case "-l":
			case "قائمة": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};