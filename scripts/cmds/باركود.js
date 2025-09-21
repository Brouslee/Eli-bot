const qrcode = require('qrcode');
const jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "باركود",
		version: "1.0",
		author: "SiAM",
		countDown: 5,
		role: 0,
		shortDescription : "اصنع رمز QR أو فك شفرة رمز QR",
		longDescription: "البوت ينشئ رمز QR بناءً على النص الذي تدخله ويمكنه أيضًا فك شفرة رمز QR من صورة",
		category: "صورة",
		guide:{
			ar: "\n{pn} انشئ 'نصك'\n{pn} فك (بالرد على صورة)"
		}
	},

	onStart: async function ({ api, args, message, event }) {
		const command = args[0];
		const text = args.slice(1).join(" ");

		if (command === "انشئ") {
			if (!text) {
				return message.reply("⚠️ الرجاء إدخال النص لإنشاء رمز QR");
			}

			const filePath = path.join(__dirname, `${Date.now()}.jpeg`);

			try {
				await qrcode.toFile(filePath, text);
				message.reply({
					body: "✅ هذا رمز QR الذي أنشأته:",
					attachment: fs.createReadStream(filePath),
				}, () => fs.unlinkSync(filePath));
			} catch (error) {
				console.log(error);
				message.reply("❌ حدث خطأ أثناء إنشاء رمز QR");
			}
		} else if (command === "فك") {
			let imageUrl;

			if (event.type === "message_reply") {
				if (["photo", "sticker"].includes(event.messageReply.attachments[0].type)) {
					imageUrl = event.messageReply.attachments[0].url;
				}
			} else if (args[1]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
				imageUrl = args[1];
			} else {
				return message.reply("⚠️ الرجاء إدخال رابط صورة صالح أو الرد على صورة");
			}

			const decodedText = await decodeQRCode(imageUrl);

			if (decodedText) {
				message.reply(`📄 النص المستخرج من رمز QR هو:\n\n${decodedText}`);
			} else {
				message.reply("❌ لم أتمكن من فك شفرة رمز QR");
			}
		} else {
			message.reply("⚠️ إدخال غير صالح\nيرجى اتباع:\n$رمز_qr انشئ 'نصك'\n$رمز_qر فك\n\nمثال:\n$رمز_qr انشئ مرحبا\n\nلفك الشفرة، رد على الصورة مع:\n$رمز_qr فك");
		}
	},
};

async function decodeQRCode(imageUrl) {
	try {
		const image = await loadImage(imageUrl);
		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		const imageData = ctx.getImageData(0, 0, image.width, image.height);
		const code = jsQR(imageData.data, imageData.width, imageData.height);
		const decodedText = code ? code.data : null;
		return decodedText;
	} catch (error) {
		console.log(error);
		throw error;
	}
}