module.exports = {  
	config: {  
		name: "رصيد",  
		aliases: ["رصيده", "رصيدها", "رصيدي"],  
		version: "1.2",  
		author: "sifo anter",  
		countDown: 5,  
		role: 0,  
		shortDescription: {  
			ar: "▸ ◉ عرض رصيدك في البوت"  
		},  
		category: "إقتصاد",  
		guide: {  
			ar: "{pn}: عرض رصيدك انت\n{pn} @تاغ: عرض رصيد اللي في التاغ"  
		}  
	},  

	langs: {  
		ar: {  
		    money: "▸ ◉ رصيدك الحالي\n│ عندك %1 $",  
		    moneyOf: "▸ ◉ رصيد %1\n│ عنده %2 $"  
		}  
	},  

	onStart: async function ({ message, usersData, event, getLang, api }) {  
		if (Object.keys(event.mentions).length > 0) {  
			const uids = Object.keys(event.mentions);  
			let msg = "";  
			for (const uid of uids) {  
				const userName = (await api.getUserInfo(uid))[uid].name;
				const userMoney = await usersData.get(uid, "money");  
				msg += getLang("moneyOf", userName, userMoney) + '\n';  
			}  
			return message.reply(msg);  
		}  
		const userData = await usersData.get(event.senderID);  
		message.reply(getLang("money", userData.money));  
	}  
};