const { getTime } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.5",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		ar: {
			session1: "الصباح",
			session2: "الظهر",
			session3: "العصر",
			session4: "المساء",
			leaveType1: "غادر المجموعة",
			leaveType2: "تم طرده من المجموعة",
			defaultLeaveMessage: `▸ ◉ خروج عضو
│ العضو: {userName}
│ الحدث: {type}
│ المجموعة: {threadName}
│ وقت الجلسة: {session}`
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage) return;

				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID()) return;

				const hours = getTime("HH");
				const threadName = threadData.threadName;
				const userName = await usersData.getName(leftParticipantFbId);

				let leaveMessage = getLang("defaultLeaveMessage");
				leaveMessage = leaveMessage
					.replace(/\{userName\}/g, userName)
					.replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
					.replace(/\{threadName\}/g, threadName)
					.replace(/\{session\}/g, 
						hours <= 10 ? getLang("session1") :
						hours <= 12 ? getLang("session2") :
						hours <= 18 ? getLang("session3") :
						getLang("session4")
					);

				const form = {
					body: leaveMessage,
					mentions: leaveMessage.includes("{userNameTag}") ? [{ id: leftParticipantFbId, tag: userName }] : null,
					attachment: []
				};

				// إضافة صورة العضو
				form.attachment.push(await global.utils.getStream(`https://graph.facebook.com/${leftParticipantFbId}/picture?height=512&width=512&access_token=${api.getAppAccessToken()}`));

				message.send(form);
			};
	}
};
