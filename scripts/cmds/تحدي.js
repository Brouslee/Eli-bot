const fs = require('fs');

module.exports = {
  config: {
    name: "تحدي",
    aliases: "ت",
    version: "1.3",
    author: "Loid Butter + gpt",
    countDown: 5,
    role: 0,
    shortDescription: "▸ احصل على تحدي عشوائي",
    longDescription: "▸ هذا الأمر يعطيك تحدي من القائمة بشكل منسق",
    category: "لعبة",
    guide: { ar: "{pn} تحدي" }
  },

  onStart: async function ({ message }) {
    const dareChallenges = JSON.parse(fs.readFileSync("Tahdi.json"));
    const randomIndex = Math.floor(Math.random() * dareChallenges.length);
    const randomChallenge = dareChallenges[randomIndex];

    const msg =
`▸ ◉ تحديك اليوم:
│ ${randomChallenge}
▸ حاول تنفذه بأفضل طريقة واستمتع باللعب`;

    message.reply(msg);
  }
}