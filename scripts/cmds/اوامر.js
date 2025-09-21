const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

const images = [
    "https://i.ibb.co/PZxFWbhY/image.jpg",
    "https://i.ibb.co/kgFqW4hY/image.jpg",
    "https://i.ibb.co/Mkpv700s/image.jpg"
];

module.exports = {
    config: {
        name: "help",
        version: "1.23",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: { en: "View command usage" },
        category: "info"
    },

    onStart: async function ({ message, args, event, threadsData, role }) {
        const threadID = event.threadID;
        const prefix = getPrefix(threadID);

        // ترتيب الأوامر حسب الكاتيجوري
        const categoryMap = {};
        for (const [, cmd] of commands) {
            if (cmd.config.role > 1 && role < cmd.config.role) continue;
            const category = (cmd.config.category || "بدون تصنيف").toLowerCase();
            if (!categoryMap[category]) categoryMap[category] = [];
            categoryMap[category].push(cmd.config.name);
        }

        let msg = "╮─━─━─━─━─━─━─━─╭\n       𝑬𝒍𝒊 - 𝑪𝒎𝒅𝒔\n╯─━─━─━─━─━─━─━─╰\n";
        msg += `📄 الصفحة: 1/1\n─────────────────\n`;

        Object.keys(categoryMap).sort().forEach((cat, idx, arr) => {
            msg += `▸ | *${capitalize(cat)}* :\n │ ◉ ${categoryMap[cat].sort().join(" ◉ ")}\n`;
            if (idx < arr.length - 1) msg += "\n";
        });

        msg += `─────────────────\n✦ ملاحظات ✦\n• لتحميل فيديو: أرسل الرابط مباشرة\n• لبدء محادثة ممتعة أكتب ايلي "رسالتك"\n• لشرح أمر أكتب شرح "اسم الأمر"\n─────────────────\n`;
        msg += `▸ ◉ عدد الاوامر: ${commands.size}\n─────────────────\n\n╮─•° المـالِـك °•─╭\n https://m.me/ukidn`;

        // اختيار صورة عشوائية وحفظ مؤقتًا
        const imageUrl = images[Math.floor(Math.random() * images.length)];
        const imageBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
        const tempPath = path.join(__dirname, "temp_help_image.jpg");
        fs.writeFileSync(tempPath, Buffer.from(imageBuffer));

        // إرسال الرسالة مع الصورة كمرفق
        return message.reply({ body: msg, attachment: fs.createReadStream(tempPath) });
    }
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}