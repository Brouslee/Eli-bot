module.exports = {
        config: {
                name: "اكتبي",
                version: "1.0",
                author: "Samir", // Time to wait before executing command again (seconds)
                role: 2,
                category: "المطور",
                guide: {
                        vi: "Not Available",
                        ar: "أكتب + (الرسالة التي تريد أن يكتبها البوت)"
                } 
        },

        onStart: async function ({ api, args, event }) {
        var say = args.join(" ")
        if (!say) api.sendMessage("أرحوك أدخل رسالة", event.threadID, event.messageID)
        else api.sendMessage(`${say}`, event.threadID, event.messageID);
  }

};