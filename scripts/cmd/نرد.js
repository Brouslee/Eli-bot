module.exports = {
  config: {
    name: "نرد",
    version: "1.0",
    author: "Loid Butter - معدل عربي",
    role: 0,
    countDown: 10,
    category: "لعبة فردية",
    shortDescription: { ar: "▸ لعبة النرد (كبير / صغير)" },
    longDescription: { ar: "▸ جرب حظك بلعبة النرد، اختار كبير أو صغير وحط رهانك" },
    guide: { ar: "{prefix}نرد [كبير/صغير] [المبلغ]" }
  },

  onStart: async function ({ args, message, usersData, event }) {
    const betType = args[0];
    const betAmount = parseInt(args[1]);
    const userData = await usersData.get(event.senderID);

    if (!["كبير", "صغير"].includes(betType)) {
      return message.reply("▸ ◉ خطأ\n│ لازم تختار: كبير أو صغير");
    }

    if (!Number.isInteger(betAmount) || betAmount < 50) {
      return message.reply("▸ ◉ تحذير\n│ أقل رهان مسموح هو 50");
    }

    if (betAmount > userData.money) {
      return message.reply("▸ ◉ خطأ\n│ ما عندك رصيد كافي للرهان");
    }

    const dice = [1, 2, 3, 4, 5, 6];
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(dice[Math.floor(Math.random() * dice.length)]);
    }

    const total = results.reduce((a, b) => a + b, 0);
    const isSmall = total >= 4 && total <= 10;
    const isBig = total >= 11 && total <= 17;
    const resultString = results.join(" | ");

    if ((betType === "صغير" && isSmall) || (betType === "كبير" && isBig)) {
      userData.money += betAmount;
      await usersData.set(event.senderID, userData);
      const winMsg = 
`▸ ◉ مبروك
│ النتيجة: [ ${resultString} ] = ${total}
▸ ربحت ${betAmount} عملة`;
      return message.reply(winMsg);
    } else {
      userData.money -= betAmount;
      await usersData.set(event.senderID, userData);
      const loseMsg = 
`▸ ◉ حظ أوفر
│ النتيجة: [ ${resultString} ] = ${total}
▸ خسرت ${betAmount} عملة`;
      return message.reply(loseMsg);
    }
  }
};