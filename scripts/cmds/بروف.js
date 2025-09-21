const axios = require("axios");

module.exports = {
	config: {
		name: "بروف",
		aliases: ["تغيير-الافاتار", "setavatar"],
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			ar: "تغيير صورة البوت",
			en: "Change bot avatar"
		},
		longDescription: {
			ar: "تغيير صورة البوت",
			en: "Change bot avatar"
		},
		category: "المطور",
		guide: {
			ar: "   {pn} [<رابط الصورة> | <رد على رسالة فيها صورة>] [<وصف> | اتركه فارغ] [<مدة مؤقتة بالثواني> | اتركه فارغ]"
				+ "\nيمكنك الرد على رسالة تحتوي صورة بكتابة: {pn}"
				+ "\nأو إرسال رسالة مع صورة وكتابة: {pn}"
				+ "\n\nملاحظات:"
				+ "\n  + الوصف: يظهر مع تغيير الصورة إذا وضعته"
				+ "\n  + المدة المؤقتة: تحدد مدة الصورة المؤقتة بالثواني"
				+ "\nأمثلة:"
				+ "\n   {pn} https://example.com/image.jpg: تغيير الصورة بدون وصف وبدون انتهاء"
				+ "\n   {pn} https://example.com/image.jpg مرحبا: تغيير الصورة مع وصف 'مرحبا' بدون انتهاء"
				+ "\n   {pn} https://example.com/image.jpg مرحبا 3600: تغيير الصورة مع وصف 'مرحبا' لمدة ساعة مؤقتة"
		}
	},

	langs: {
		ar: {
			cannotGetImage: "❌ | حدث خطأ أثناء جلب الصورة",
			invalidImageFormat: "❌ | صيغة الصورة غير صالحة",
			changedAvatar: "✅ | تم تغيير صورة البوت بنجاح"
		},
		en: {
			cannotGetImage: "❌ | An error occurred while querying the image url",
			invalidImageFormat: "❌ | Invalid image format",
			changedAvatar: "✅ | Changed bot avatar successfully"
		}
	},

	onStart: async function ({ message, event, api, args, getLang }) {
		const imageURL = (args[0] || "").startsWith("http") ? args.shift() : event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;
		const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
		const caption = args.join(" ");
		if (!imageURL)
			return message.SyntaxError();
		let response;
		try {
			response = (await axios.get(imageURL, {
				responseType: "stream"
			}));
		}
		catch (err) {
			return message.reply(getLang("cannotGetImage"));
		}
		if (!response.headers["content-type"].includes("image"))
			return message.reply(getLang("invalidImageFormat"));
		response.data.path = "avatar.jpg";

		api.changeAvatar(response.data, caption, expirationAfter ? expirationAfter * 1000 : null, (err) => {
			if (err)
				return message.err(err);
			return message.reply(getLang("changedAvatar"));
		});
	}
};