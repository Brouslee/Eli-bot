const fs = require('fs');

module.exports = {
  config: {
    name: "سلاحي",
    author: "حسين يعقوبي",
    aliases: ["myweapon"],
    category: "متعة",
    shortDescription: { ar: "▸ ◉ اعرض سلاحك وعدد الزومبي والطلقات ونسبة البقاء" },
    longDescription: { ar: "▸ ◉ يعطيك معلومات عن سلاحك وعدد الزومبي والطلقات ونسبة البقاء" },
    guide: { ar: "{p}سلاحي" }
  },

  onStart: async function ({ message }) {
    const json = JSON.parse(fs.readFileSync('weapons.json'));
    const data = json[Math.floor(Math.random() * json.length)];
    const link = data.link;

    const zombies = Math.floor(Math.random() * 100) + 1;
    const bullets = Math.floor(Math.random() * 50) + 1;
    const survival = Math.floor((bullets / zombies) * 100);

    const msg = 
`▸ ◉ مواجهة الزومبي
│ عدد الزومبي: ${zombies}
│ طلقاتك: ${bullets}
│ نسبة البقاء على قيد الحياة: ${survival}%
│ سلاحك: ${data.name}`;

    message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(link)
    });
  }
};