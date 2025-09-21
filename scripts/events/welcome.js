const { getTime } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.8",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		ar: {
			session1: "صباح",
			session2: "ظهر",
			session3: "عصر",
			session4: "مساء",
			welcomeBot: `▸ ◉ تم توصيل البوت بنجاح!`,
			defaultWelcomeMessage: `▸ ◉ مرحبًا {userName}
│ أهلًا بك في {boxName}
│ نتمنى لك {session} ممتع!`,
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// إذا العضو الجديد هو البوت
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeBot"));
				}

				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [], mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1) multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId)) continue;
						userName.push(user.fullName);
						mentions.push({ tag: user.fullName, id: user.userFbId });
					}

					if (userName.length == 0) return;

					const welcomeMessage = getLang("defaultWelcomeMessage")
						.replace(/\{userName\}/g, userName.join(", "))
						.replace(/\{boxName\}/g, threadName)
						.replace(/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					const form = {
						body: welcomeMessage,
						mentions,
						attachment: []
					};

					// إضافة صورة العضو
					for (const user of dataAddedParticipants) {
						form.attachment.push(await global.utils.getStream(`https://graph.facebook.com/${user.userFbId}/picture?height=512&width=512&access_token=${api.getAppAccessToken()}`));
					}

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
