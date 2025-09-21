const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "محة",
		aliases: ["kiss"],
		version: "1.0",
		author: "NIB",
		countDown: 5,
		role: 0,
		shortDescription: "أرسل قبلة لشخص",
		longDescription: "اصنع صورة قبلة بينك وبين الشخص المذكور أو المرد عليه",
		category: "مرح",
		guide: "{pn} @اسم_الشخص أو الرد على رسالته"
	},

	onStart: async function ({ api, message, event, usersData }) {
		let one = event.senderID;
		let two;

		const mention = Object.keys(event.mentions);

		// إذا فيه mention
		if (mention.length > 0) {
			two = mention[0];
		} 
		// إذا الرد على رسالة
		else if (event.messageReply && event.messageReply.senderID) {
			two = event.messageReply.senderID;
		} 
		// لا يوجد شخص
		else {
			return message.reply("يرجى ذكر شخص أو الرد على رسالته لإرسال القبلة");
		}

		const avatarURL1 = await usersData.getAvatarUrl(one);
		const avatarURL2 = await usersData.getAvatarUrl(two);

		const img = await new DIG.Kiss().getImage(avatarURL1, avatarURL2);
		const pathSave = `${__dirname}/tmp/${one}_${two}kiss.png`;
		fs.writeFileSync(pathSave, Buffer.from(img));

		const content = "😘 قبلة لطيفة!";
		message.reply({
			body: content,
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};