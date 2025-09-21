const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "سلوت",
    version: "1.0",
    author: "الين",
    shortDescription: { ar: "لعبة سلوت" },
    longDescription: { ar: "لعبة سلوت." },
    category: "العاب",
  },
  langs: {
    ar: {
      invalid_amount: "حط رقم كبير احتمال تفوز بالضعف خاطر يا بني",
      not_enough_money: "شوف رصيدك اذا عندك هذا المبلغ",
      spin_message: "جاري الدوران 🎰...",
      win_message: "لقد ربحت %1 دولار 🥳!",
      lose_message: "لقد خسرت %1 دولار 🤭💔.",
      jackpot_message: "دييييم! ثلاثي %1 هذا المبلغ الذي ربحته 🙌💗!",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid_amount"));
    if (amount > userData.money) return message.reply(getLang("not_enough_money"));

    const slots = ["🍒", "🍇", "🍊", "🍉", "🍋", "🍎", "🍓", "🍑", "🥝"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    // تحديث الرصيد
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    // صياغة الرسالة بالشكل المنسق
    const currentTime = new Date();
    const timeStr = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2,'0')}`;
    let resultText = "";

    if (winnings > 0) {
      if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
        resultText = getLang("jackpot_message", winnings);
      } else {
        resultText = getLang("win_message", winnings);
      }
    } else {
      resultText = getLang("lose_message", -winnings);
    }

    const finalMessage =
`▸ ◉ 🎰 لعبة سلوت
│ الرموز: ${slot1} | ${slot2} | ${slot3}
│ النتيجة: ${winnings > 0 ? (slot1==="🍒"&&slot2==="🍒"&&slot3==="🍒" ? "جاكبوت" : "فوز") : "خسارة"}
│ المبلغ: ${winnings > 0 ? "+" : "-"}${Math.abs(winnings)} دولار
│ الرصيد الحالي: ${userData.money + winnings} دولار
│ الوقت: ${timeStr}`;

    return message.reply(finalMessage);
  }
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") return betAmount * 10;
  else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") return betAmount * 5;
  else if (slot1 === slot2 && slot2 === slot3) return betAmount * 3;
  else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) return betAmount * 2;
  else return -betAmount;
}