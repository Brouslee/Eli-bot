const { getPrefix } = global.utils;
const { commands } = global.GoatBot;
const path = require("path");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "شرح",
        aliases: ["شرحح", "شرح"],
        version: "1.1",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        category: "info",
        shortDescription: { ar: "▸ ◉ عرض شرح أي أمر بطريقة مرتبة" }
    },

    onStart: async function ({ message, args, event }) {
        const { threadID } = event;
        const prefix = getPrefix(threadID);

        if (!args[0]) 
          return message.reply(`▸ ◉ ⚠️ | يرجى كتابة اسم الأمر المراد شرحه`);

        const commandName = args[0].toLowerCase();
        let command = commands.get(commandName) || commands.get(GoatBot.aliases.get(commandName));

        if (!command) 
          return message.reply(`▸ ◉ ❌ | الأمر "${args[0]}" غير موجود`);

        // إعداد البيانات
        const config = command.config;
        const name = config.name;
        const desc = config.shortDescription?.ar || "بدون وصف";
        const aliasesString = config.aliases?.join(", ") || "لا يوجد";
        const roleText = config.role == 0 ? "كل المستخدمين" :
                         config.role == 1 ? "أدمن المجموعة" : "أدمن البوت";

        // إعداد طريقة الاستعمال اعتماداً على guide
        let guideText = "لا يوجد طريقة استخدام";
        if (config.guide?.ar) {
            if (typeof config.guide.ar === "string") guideText = config.guide.ar;
            else guideText = config.guide.ar.replace(/\{pn\}/g, prefix + name);
        }

        // صياغة الرسالة بالقالب المطلوب
        const msg = 
`▸ ◉ شرح الأمر: ${name}
│ الوصف: ${desc}
│ أسماء أخرى: ${aliasesString}
│ الصلاحية: ${roleText}
│ طريقة الاستعمال:
${guideText}
▸ ◉ لمزيد من المعلومات:
│ رابط المالك: https://m.me/ukidn`;

        return message.reply(msg);
    }
};