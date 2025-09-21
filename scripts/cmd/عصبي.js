const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "عصبي",
		version: "1.2",
		author: "NTKhang + تعديل",
		countDown: 5,
		role: 0,
		shortDescription: "Trigger image with text",
		longDescription: "Trigger image with optional text",
		category: "image",
		guide: "{pn} [نص] أو رد على شخص"
	},

	onStart: async function ({ event, message, usersData, args }) {
		const uid = Object.keys(event.mentions)[0] || event.messageReply?.senderID || event.senderID;
		const avatarURL = await usersData.getAvatarUrl(uid);
		const img = await new DIG.Triggered().getImage(avatarURL);
		const pathSave = `${__dirname}/tmp/${uid}_Trigger.gif`;
		fs.writeFileSync(pathSave, Buffer.from(img));

		// نص افتراضي لو ما كتب المستخدم شيء
		const text = args.join(" ") || "لا يا عصبيي خفت منك😭💔";

		message.reply({
			body: text,
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};