const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "1.6",
		author: "NTKhang",
		envConfig: { allow: true },
		category: "events"
	},

	langs: {
		ar: {
			title: "▸ ◉ سجلات البوت",
			added: `▸ ◉ ✅
│ الحدث: تم إضافة البوت إلى مجموعة جديدة
│ بواسطة: %1`,
			kicked: `▸ ◉ ❌
│ الحدث: تم طرد البوت من المجموعة
│ بواسطة: %1`,
			footer: `▸ ◉ معلومات إضافية
│ معرف المستخدم: %1
│ اسم المجموعة: %2
│ معرف المجموعة: %3
│ الوقت: %4`
		}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		if (
			(event.logMessageType == "log:subscribe" && event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
			|| (event.logMessageType == "log:unsubscribe" && event.logMessageData.leftParticipantFbId == api.getCurrentUserID())
		) return async function () {
			let msg = getLang("title");
			const { author, threadID } = event;
			if (author == api.getCurrentUserID()) return;

			const { config } = global.GoatBot;
			const threadInfo = await api.getThreadInfo(threadID);
			const threadName = threadInfo.threadName;
			const threadPic = threadInfo.imageSrc || null;
			const authorName = await usersData.getName(author);

			if (event.logMessageType == "log:subscribe") {
				if (!event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
					return;
				msg += getLang("added", authorName);
			} else if (event.logMessageType == "log:unsubscribe") {
				if (event.logMessageData.leftParticipantFbId != api.getCurrentUserID())
					return;
				msg += getLang("kicked", authorName);
			}

			const time = getTime("DD/MM/YYYY HH:mm:ss");
			msg += getLang("footer", author, threadName, threadID, time);

			const form = { body: msg, attachment: [] };

			// إضافة صورة المجموعة إذا موجودة
			if (threadPic) form.attachment.push(await global.utils.getStream(threadPic));

			for (const adminID of config.adminBot)
				api.sendMessage(form, adminID);
		};
	}
};			if (author == api.getCurrentUserID())
				return;
			let threadName;
			const { config } = global.GoatBot;

			if (event.logMessageType == "log:subscribe") {
				if (!event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
					return;
				threadName = (await api.getThreadInfo(threadID)).threadName;
				const authorName = await usersData.getName(author);
				msg += getLang("added", authorName);
			}
			else if (event.logMessageType == "log:unsubscribe") {
				if (event.logMessageData.leftParticipantFbId != api.getCurrentUserID())
					return;
				const authorName = await usersData.getName(author);
				const threadData = await threadsData.get(threadID);
				threadName = threadData.threadName;
				msg += getLang("kicked", authorName);
			}
			const time = getTime("DD/MM/YYYY HH:mm:ss");
			msg += getLang("footer", author, threadName, threadID, time);

			for (const adminID of config.adminBot)
				api.sendMessage(msg, adminID);
		};
	}
};
