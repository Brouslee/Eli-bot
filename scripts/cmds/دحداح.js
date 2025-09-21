module.exports = {
  config: {
    name: "دحداح",
    version: "1.0",
    author: "اسمك",
    role: 0,
    countdown: 10,
    reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
    category: "لعبة فردية",
    shortDescription: { ar: "العب لعبة دحداح (حجر ورقة مقص) مع البوت" },
    longDescription: { ar: "اختار حجر، ورقة، أو مقص وحاول الفوز ضد البوت للحصول على الجائزة" },
    guide: { ar: "{prefix}دحداح <حجر|ورقة|مقص>" }
  },

  onStart: async function ({ message, event, args, commandName, usersData }) {
    const choices = ["حجر", "ورقة", "مقص"];
    const userChoice = args[0];

    if (!userChoice || !choices.includes(userChoice)) {
      return message.reply(
`▸ ◉ خطأ في الاختيار
│ لازم تختار يا حجر يا ورقة يا مقص`
      );
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let resultText = "";
    let reward = 0;

    if (userChoice === botChoice) {
      resultText = "▸ ◉ تعادل ⚖️\n│ حاول مرة ثانية";
    } else if (
      (userChoice === "حجر" && botChoice === "مقص") ||
      (userChoice === "ورقة" && botChoice === "حجر") ||
      (userChoice === "مقص" && botChoice === "ورقة")
    ) {
      reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      await usersData.addMoney(event.senderID, reward);
      resultText = `▸ ◉ مبروك!
│ لقد فزت بمبلغ ${reward} دولار 💰`;
    } else {
      resultText = "▸ ◉ انا فزت 😎\n│ حظ اوفر المرة الجاية";
    }

    const finalMsg = 
`▸ ◉ لعبتك:
│ انت اخترت: ${userChoice}
│ انا اخترت: ${botChoice}
${resultText}`;

    message.reply(finalMsg);
  },
};