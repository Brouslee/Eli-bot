module.exports = {
	config: {
		name: "checkwarn",
		version: "1.4",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		ar: {
			warn: `▸ ◉ تحذير عضو
│ العضو: %1
│ UID: %2
│ تم تحذيره 3 مرات وتم حظره من المجموعة
│ لإلغاء الحظر استخدم الأمر: "%3warn unban <uid>" (مع استبدال uid بالمعرف)`,
			needPermission: `▸ ◉ ⚠️ البوت يحتاج صلاحيات مدير لإزالة العضو المحظور`
		}
	},

	onStart: async ({ threadsData, message, event, api, client, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const { threadID } = event;
				const { data } = await threadsData.get(threadID);
				const warnList = data.warn || [];
				const { addedParticipants } = event.logMessageData;

				for (const user of addedParticipants) {
					const findUser = warnList.find(w => w.userID == user.userID);
					if (findUser && findUser.list >= 3) {
						const userName = user.fullName;
						const uid = user.userFbId;

						message.send({
							body: getLang("warn", userName, uid, client.getPrefix(threadID)),
							mentions: [{ tag: userName, id: uid }]
						}, function () {
							api.removeUserFromGroup(uid, threadID, (err) => {
								if (err)
									return message.send(getLang("needPermission"));
							});
						});
					}
				}
			};
	}
};								tag: userName,
								id: uid
							}]
						}, function () {
							api.removeUserFromGroup(uid, threadID, (err) => {
								if (err)
									return message.send(getLang("needPermission"));
							});
						});
					}
				}
			};
	}
};
