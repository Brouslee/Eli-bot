module.exports = {
	config: {
		name: "سرقة",
		version: "3.0",
		author: "SIFOANTER + GPT",
		countDown: 60,
		role: 0,
		description: { ar: "لعبة سرقة تفاعلية: هدف عشوائي أو مستخدم محدد" },
		category: "الألعاب",
		guide: {
			ar: "{pn} <@المستخدم|عشوائي>: محاولة سرقة المستخدم أو هدف عشوائي"
		}
	},

	langs: {
		ar: {
			robbingUser: "▸ ◉ جاري محاولة السرقة...\n│ الهدف: %1\n│ انتظر النتيجة...",
			robSuccess: "▸ ◉ سرقة ناجحة!\n│ حصلت على: %1 💰\n│ تمت إضافة المبلغ لحسابك",
			robFailed: "▸ ◉ فشل السرقة!\n│ تم اكتشافك!\n│ غرامة: %1 💰\n│ حاول لاحقًا",
			noMention: "▸ ◉ حدد هدف السرقة أو اكتب 'عشوائي'",
			selfRob: "▸ ◉ لا يمكنك سرقة نفسك!",
			notEnoughMoney: "▸ ◉ تحتاج على الأقل %1 💰 للقيام بالسرقة",
			targetBroke: "▸ ◉ الهدف مفلس! لا يوجد شيء للسرقة"
		}
	},

	randomTargets: [
		"المدينة", "المكتبة", "المستودع", "المصرف", "المتحف", "المول", "المطعم", "المقهى", "الورشة", "المستشفى",
		"المدرسة", "الملعب", "محطة القطار", "الميناء", "السوق", "البرج", "الحديقة", "العمارة", "الفندق", "السينما"
	],

	targetChances: [
		0.6, 0.5, 0.55, 0.4, 0.7, 0.3, 0.65, 0.5, 0.45, 0.6,
		0.5, 0.55, 0.35, 0.7, 0.4, 0.6, 0.5, 0.45, 0.6, 0.5
	],

	targetRewards: [
		1000, 1500, 2000, 1200, 1800, 2200, 1600, 1400, 2500, 1900,
		1700, 1300, 2000, 1500, 1600, 1800, 1400, 2100, 2300, 1200
	],

	onStart: async function ({ message, usersData, event, args, getLang }) {
		const userData = await usersData.get(event.senderID);
		const userMoney = userData.money || 0;

		if (args.length === 0) return message.reply("▸ ◉ دليل السرقة:\n│ سرقة @مستخدم أو 'عشوائي'\n▸ ◉ اللعبة وهمية للترفيه فقط!");

		let target = args[0];
		let targetName, chance, reward, isRandom = false;

		if (target === "عشوائي") {
			isRandom = true;
			const idx = Math.floor(Math.random() * this.randomTargets.length);
			targetName = this.randomTargets[idx];
			chance = this.targetChances[idx];
			reward = this.targetRewards[idx];
		} else if (Object.keys(event.mentions).length > 0) {
			const targetUID = Object.keys(event.mentions)[0];
			if (targetUID === event.senderID) return message.reply(getLang("selfRob"));

			const targetData = await usersData.get(targetUID);
			const targetMoney = targetData.money || 0;
			if (targetMoney < 100) return message.reply(getLang("targetBroke"));

			targetName = event.mentions[targetUID].replace("@", "");
			chance = 0.6; // نسبة نجاح افتراضية للمستخدم
			reward = Math.min(Math.floor(targetMoney * 0.15), 2500);
		} else {
			return message.reply(getLang("noMention"));
		}

		message.reply(getLang("robbingUser", targetName));

		setTimeout(async () => {
			const success = Math.random() < chance;
			if (success) {
				await usersData.set(event.senderID, { money: userMoney + reward });
				if (!isRandom) {
					const targetUID = Object.keys(event.mentions)[0];
					const targetData = await usersData.get(targetUID);
					const targetMoney = targetData.money || 0;
					await usersData.set(targetUID, { money: Math.max(0, targetMoney - reward) });
				}
				message.reply(getLang("robSuccess", reward.toLocaleString('ar-SA')));
			} else {
				const penalty = Math.floor(Math.random() * 2000) + 500;
				await usersData.set(event.senderID, { money: Math.max(0, userMoney - penalty) });
				message.reply(getLang("robFailed", penalty.toLocaleString('ar-SA')));
			}
		}, 4000);
	}
};