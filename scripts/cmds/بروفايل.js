module.exports = {
	config: {
		name: "بروفايل",
		version: "1.1",
		author: "NIB",
		countDown: 5,
		role: 0,
		shortDescription: "صورة البروفايل",
		longDescription: "صورة البروفايل",
		category: "أدوات",
		guide: {
			en: "   {pn} @تاغ"
		}
	},

	langs: {
		vi: {
			noTag: "Bạn phải tag người bạn muốn tát"
		},
		en: {
			noTag: "يجب عليك وضع علامة على الشخص الذي تريد تريد رؤية صورت"
		}
	},

	onStart: async function ({ event, message, usersData, args, getLang }) {
    let avt;
		const uid1 = event.senderID;
		const uid2 = Object.keys(event.mentions)[0];
		if(event.type == "message_reply"){
      avt = await usersData.getAvatarUrl(event.messageReply.senderID)
    } else{
      if (!uid2){avt =  await usersData.getAvatarUrl(uid1)
              } else{avt = await usersData.getAvatarUrl(uid2)}}


		message.reply({
			body:"اوففف شهالجمال أذوبب انا 🤭",
			attachment: await global.utils.getStreamFromURL(avt)
	})
  }
};
