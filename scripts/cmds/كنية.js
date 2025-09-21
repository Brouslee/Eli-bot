async function checkShortCut(nickname, uid, usersData) {  
	try {  
		/\{userName\}/gi.test(nickname) ? nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid)) : null;  
		/\{userID\}/gi.test(nickname) ? nickname = nickname.replace(/\{userID\}/gi, uid) : null;  
		return nickname;  
	}  
	catch (e) {  
		return nickname;  
	}  
}  

module.exports = {  
	config: {  
		name: "كنية",  
		version: "1.5",  
		aliases: ["لقبي", "كنيتي"],  
		author: "NTKhang&ihab",  
		countDown: 5,  
		role: 0,  
		shortDescription: { ar: "تغيير كنية عضو أو الجميع" },  
		longDescription: { ar: "يمكنك تعديل كنية شخص محدد أو كل الأعضاء بصيغة مع {userName} و {userID}" },  
		category: "الخـدمات",  
		guide: {  
			ar: {  
				body: `▸ ◉ طريقة الاستخدام:  
│ كنية <الكنية>: لتغيير كنيتك أنت  
│ كنية @تاغ <الكنية>: لتغيير كنية الشخص الموسوم  
│ كنية الكل <الكنية>: لتغيير كنية كل الأعضاء  
│ يمكنك استخدام: {userName} لعرض الاسم و {userID} لعرض معرف العضو`,  
				attachment: {  
					[`${__dirname}/assets/guide/setname_1.png`]: "https://i.ibb.co/gFh23zb/guide1.png",  
					[`${__dirname}/assets/guide/setname_2.png`]: "https://i.ibb.co/BNWHKgj/guide2.png"  
				}  
			}  
		}  
	},  

	langs: {  
		ar: {  
			error: `▸ ◉ حدث خطأ  
│ يرجى التأكد من رابط الدعوة أو المحاولة لاحقًا`,  
			success: `▸ ◉ تم تغيير الكنية بنجاح  
│ المستخدم: %1  
▸ ◉ الكنية الجديدة: %2`,  
			usage: `▸ ◉ طريقة الاستخدام:  
│ كنية <الكنية>: لتغيير كنيتك  
│ كنية @تاغ <الكنية>: لتغيير كنية الشخص الموسوم  
│ كنية الكل <الكنية>: لتغيير كنية كل الأعضاء`  
		}  
	},  

	onStart: async function ({ args, message, event, api, usersData, getLang }) {  
		const mentions = Object.keys(event.mentions);  
		let uids = [];  
		let nickname = args.join(" ");  

		if (!nickname) return message.reply(getLang("usage"));  

		if (args[0] === "الكل") {  
			uids = (await api.getThreadInfo(event.threadID)).participantIDs;  
			nickname = args.slice(1).join(" ");  
		}  
		else if (mentions.length) {  
			uids = mentions;  
			const allName = new RegExp(Object.values(event.mentions).join("|"), "g");  
			nickname = nickname.replace(allName, "").trim();  
		}  
		else {  
			uids = [event.senderID];  
			nickname = nickname.trim();  
		}  

		for (const uid of uids) {  
			try {  
				const newNick = await checkShortCut(nickname, uid, usersData);  
				await api.changeNickname(newNick, event.threadID, uid);  
				message.reply(getLang("success", uid, newNick));  
			}  
			catch (e) {  
				message.reply(getLang("error"));  
			}  
		}  
	}  
};