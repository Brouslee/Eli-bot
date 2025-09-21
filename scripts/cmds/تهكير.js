
module.exports = {
	config: {
		name: "تهكير",
		aliases: ["هاك", "hack"],
		version: "1.0",
		author: "SIFOANTER",
		countDown: 30,
		role: 0,
		description: {
			ar: "لعبة تهكير وهمية ممتعة مع مكافآت"
		},
		category: "الألعاب",
		guide: {
			ar: "   {pn} <@المستخدم>: محاولة تهكير حساب المستخدم"
				+ "\n   {pn} بنك: محاولة تهكير البنك"
				+ "\n   {pn} نظام: محاولة تهكير النظام"
		}
	},

	langs: {
		ar: {
			hackingUser: "💻 **بدء عملية التهكير...**\n"
				+ "🎯 الهدف: %1\n"
				+ "⏳ جاري الاختراق...",
			hackSuccess: "✅ **نجح التهكير!**\n"
				+ "💰 تم سرقة: %1 💰\n"
				+ "🎉 تم إضافة المبلغ إلى حسابك!\n"
				+ "🕵️ احذر! الضحية قد تكتشف...",
			hackFailed: "❌ **فشل التهكير!**\n"
				+ "🚨 تم اكتشافك! \n"
				+ "💸 غرامة: %1 💰\n"
				+ "🔒 نظام الحماية نشط!",
			hackingBank: "🏦 **محاولة اختراق البنك...**\n"
				+ "⚠️ مستوى الصعوبة: خطير جداً\n"
				+ "⏳ جاري فحص الأنظمة...",
			bankSuccess: "🎉 **اختراق البنك ناجح!**\n"
				+ "💎 سرقت: %1 💰\n"
				+ "🏆 أنت هاكر محترف!",
			bankFailed: "🚔 **تم القبض عليك!**\n"
				+ "⚖️ غرامة البنك: %1 💰\n"
				+ "🔒 تم حظرك مؤقتاً من البنك!",
			hackingSystem: "🖥️ **اختراق النظام...**\n"
				+ "⚠️ خطر! مستوى حماية عالي\n"
				+ "⏳ فحص الثغرات...",
			systemSuccess: "👑 **مبروك! أنت إله التهكير!**\n"
				+ "💰 مكافأة النظام: %1 💰\n"
				+ "🎖️ حصلت على لقب 'هاكر النظام'",
			systemFailed: "☠️ **النظام دمرك!**\n"
				+ "💸 خسرت كل أموالك!\n"
				+ "⚡ صدمة كهربائية افتراضية!",
			noMention: "❌ حدد هدف التهكير! استخدم @",
			notEnoughMoney: "❌ تحتاج على الأقل %1 💰 لمحاولة التهكير",
			selfHack: "🤔 لا يمكنك تهكير نفسك يا عبقري!",
			cooldown: "⏰ انتظر %1 ثانية قبل المحاولة التالية"
		}
	},

	onStart: async function ({ message, usersData, event, args, getLang }) {
		const userData = await usersData.get(event.senderID);
		const userMoney = userData.money || 0;

		if (args.length === 0) {
			return message.reply("💻 **قائمة التهكير:**\n\n🎯 تهكير @مستخدم\n🏦 تهكير بنك\n🖥️ تهكير نظام\n\n⚠️ كل العمليات وهمية وللمرح فقط!");
		}

		const target = args[0];

		// تهكير بنك
		if (target === "بنك") {
			if (userMoney < 5000) {
				return message.reply(getLang("notEnoughMoney", "5,000"));
			}

			message.reply(getLang("hackingBank"));

			setTimeout(async () => {
				const success = Math.random() < 0.3; // 30% نسبة نجاح
				
				if (success) {
					const reward = Math.floor(Math.random() * 20000) + 10000; // 10k-30k
					await usersData.set(event.senderID, { money: userMoney + reward });
					message.reply(getLang("bankSuccess", reward.toLocaleString('ar-SA')));
				} else {
					const penalty = Math.floor(userMoney * 0.3); // خسارة 30%
					await usersData.set(event.senderID, { money: userMoney - penalty });
					message.reply(getLang("bankFailed", penalty.toLocaleString('ar-SA')));
				}
			}, 5000);
			return;
		}

		// تهكير نظام
		if (target === "نظام") {
			if (userMoney < 10000) {
				return message.reply(getLang("notEnoughMoney", "10,000"));
			}

			message.reply(getLang("hackingSystem"));

			setTimeout(async () => {
				const success = Math.random() < 0.1; // 10% نسبة نجاح
				
				if (success) {
					const reward = 50000;
					await usersData.set(event.senderID, { money: userMoney + reward });
					message.reply(getLang("systemSuccess", reward.toLocaleString('ar-SA')));
				} else {
					await usersData.set(event.senderID, { money: 0 }); // خسارة كل شيء
					message.reply(getLang("systemFailed"));
				}
			}, 7000);
			return;
		}

		// تهكير مستخدم
		if (Object.keys(event.mentions).length === 0) {
			return message.reply(getLang("noMention"));
		}

		const targetUID = Object.keys(event.mentions)[0];
		if (targetUID === event.senderID) {
			return message.reply(getLang("selfHack"));
		}

		if (userMoney < 1000) {
			return message.reply(getLang("notEnoughMoney", "1,000"));
		}

		const targetName = event.mentions[targetUID].replace("@", "");
		message.reply(getLang("hackingUser", targetName));

		setTimeout(async () => {
			const success = Math.random() < 0.6; // 60% نسبة نجاح
			
			if (success) {
				const targetData = await usersData.get(targetUID);
				const targetMoney = targetData.money || 0;
				const stolenAmount = Math.min(Math.floor(targetMoney * 0.1), 3000); // 10% أو 3000 كحد أقصى
				
				if (stolenAmount > 0) {
					await usersData.set(event.senderID, { money: userMoney + stolenAmount });
					await usersData.set(targetUID, { money: targetMoney - stolenAmount });
					message.reply(getLang("hackSuccess", stolenAmount.toLocaleString('ar-SA')));
				} else {
					message.reply("💰 الهدف مفلس! لم تحصل على شيء 😅");
				}
			} else {
				const penalty = Math.floor(Math.random() * 2000) + 1000; // 1k-3k غرامة
				await usersData.set(event.senderID, { money: Math.max(0, userMoney - penalty) });
				message.reply(getLang("hackFailed", penalty.toLocaleString('ar-SA')));
			}
		}, 4000);
	}
};
