module.exports = {
	config: {
		name: "غادر",
		version: "1.0",
		author: "AL-Rulex(loufi)",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "",
			ar: "طرد البوت 😌"
		},
		longDescription: {
			vi: "",
			ar: "البوت يغادر 🐸"
		},
		category: "إدارة البوت",
		guide: {
			vi: "",
			ar: "غادر"
    }
 },
  onStart: async function ({ api, args, message, event }) {

      if (!args[0]) return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
        if (!isNaN(args[0])) return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
  }
}
