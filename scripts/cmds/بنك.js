const fs = require("fs");

module.exports = {
  config: {
    name: "بنك",
    version: "1.9",
    author: "Jun + gpt",
    countDown: 5,
    role: 0,
    category: "إقتصاد",
    shortDescription: { ar: "▸ نظام بنك إفتراضي لحسابك الشخصي 💰" },
    longDescription: { ar: "▸ نظام البنك الكامل لإيداع وسحب وتحويل الأموال وكسب الفوائد 💵" },
    guide: { ar: "▸ {prefix}بنك - استخدم أوامر البنك: إيداع _ سحب _ رصيدي _ تحويل _ قرض _ دفع_القرض" }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));

    if (!bankData[user]) {
      bankData[user] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0, loanDueDate: 0 };
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
    }

    const command = args[0];
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    if (command === "توب") {
      let page = parseInt(args[1]) || 1;
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      const entries = Object.entries(bankData).sort((a, b) => b[1].bank - a[1].bank);
      const topTen = entries.slice(start, end);

      const messageText = `▸ ◉ 🏆 توب أغنى 10 أشخاص في المجموعة\n│\n${(await Promise.all(
        topTen.map(async ([userID, data], index) => {
          const userData = await usersData.get(userID);
          return `│ ${index + start + 1}. ${userData.name} : $${data.bank}`;
        })
      )).join("\n")}\n│`;
      const totalPages = Math.ceil(entries.length / pageSize);
      const nextPageMsg = page + 1 <= totalPages ? `▸ ◉ أكتب توب ${page + 1} لعرض الصفحة التالية` : "";
      return message.reply(`${messageText}\n${nextPageMsg}\n▸ ◉ صفحة ${page}/${totalPages}`);
    }

    if (command === "إيداع") {
      if (isNaN(amount) || amount <= 0) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ أدخل مبلغ صالح للإيداع`);
      if (userMoney < amount) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ ليس لديك ما يكفي من المال`);
      bankData[user].bank += amount;
      await usersData.set(event.senderID, { money: userMoney - amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
      return message.reply(`▸ ◉ تم إيداع الأموال 💰\n│ المبلغ: ${amount} $\n│ رصيدك الآن: ${bankData[user].bank} $`);
    }

    if (command === "سحب") {
      const balance = bankData[user].bank || 0;
      if (isNaN(amount) || amount <= 0) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ أدخل مبلغ صالح للسحب`);
      if (amount > balance) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ المبلغ غير متوفر في حسابك البنكي`);
      bankData[user].bank -= amount;
      await usersData.set(event.senderID, { money: userMoney + amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
      return message.reply(`▸ ◉ تم السحب 💵\n│ المبلغ: ${amount} $\n│ رصيدك الآن: ${bankData[user].bank} $`);
    }

    if (command === "رصيدي") {
      const balance = bankData[user].bank || 0;
      return message.reply(`▸ ◉ رصيد حسابك البنكي 💳\n│ المبلغ الحالي: ${balance} $`);
    }

    if (command === "الفائدة") {
      const interestRate = 0.00004;
      const lastClaim = bankData[user].lastInterestClaimed || Date.now();
      const now = Date.now();
      const timeDiffSec = (now - lastClaim) / 1000;
      const interestEarned = bankData[user].bank * (interestRate / 365) * timeDiffSec;
      bankData[user].bank += interestEarned;
      bankData[user].lastInterestClaimed = now;
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
      return message.reply(`▸ ◉ تمت إضافة الفائدة 💹\n│ الفائدة المكتسبة: ${interestEarned.toFixed(2)} $\n│ رصيدك الآن: ${bankData[user].bank.toFixed(2)} $`);
    }

    if (command === "تحويل") {
      const balance = bankData[user].bank || 0;
      if (isNaN(amount) || amount <= 0) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ أدخل مبلغ صالح للتحويل`);
      if (balance < amount) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ رصيدك لا يكفي للتحويل`);
      if (isNaN(recipientUID)) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ أدخل آيدي صالح للمستلم`);
      if (!bankData[recipientUID]) bankData[recipientUID] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0, loanDueDate: 0 };
      bankData[user].bank -= amount;
      bankData[recipientUID].bank += amount;
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
      return message.reply(`▸ ◉ تم التحويل 💸\n│ المبلغ: ${amount} $\n│ إلى المستخدم: ${recipientUID}\n│ رصيدك الآن: ${bankData[user].bank} $`);
    }

    if (command === "قرض") {
      if (isNaN(amount) || amount <= 0) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ أدخل مبلغ صالح للقرض`);
      if (bankData[user].loan > 0) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ لديك قرض حالي`);
      if (amount > 10000) return message.reply(`▸ ◉ ⚠️ الحد الأقصى للقرض 10000 $`);
      bankData[user].loan = amount;
      bankData[user].loanDueDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
      bankData[user].bank += amount;
      await usersData.set(event.senderID, { money: userMoney + amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
      return message.reply(`▸ ◉ تم الحصول على قرض 🏦\n│ المبلغ: ${amount} $\n│ سيتم خصمه بعد أسبوع\n│ رصيدك الآن: ${bankData[user].bank} $`);
    }

    if (command === "دفع_القرض") {
      const loan = bankData[user].loan || 0;
      const dueDate = bankData[user].loanDueDate || 0;
      if (loan <= 0) return message.reply(`▸ ◉ ⚠️ عملية فاشلة\n│ ليس لديك قرض حالي`);
      const daysLate = Math.ceil((Date.now() - dueDate) / (24 * 60 * 60 * 1000));
      const interest = loan * 0.0001 * daysLate;
      const totalDue = loan + interest;
      if (isNaN(amount) || amount <= 0) return message.reply(`▸ ◉ ⚠️ الرجاء إدخال المبلغ للسداد\n│ المستحق: ${totalDue} $`);
      if (amount < totalDue) return message.reply(`▸ ◉ ⚠️ المبلغ أقل من المستحق\n│ المستحق: ${totalDue} $`);
      bankData[user].loan = 0;
      bankData[user].loanDueDate = 0;
      bankData[user].bank -= loan;
      await usersData.set(event.senderID, { money: userMoney - amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
      return message.reply(`▸ ◉ تم سداد القرض ✅\n│ القرض: ${loan} $\n│ الفائدة: ${interest.toFixed(2)} $\n│ الإجمالي المدفوع: ${totalDue} $\n│ رصيدك الآن: ${bankData[user].bank} $`);
    }

    return message.reply(
      `▸ ◉ أوامر البنك المتاحة:\n│\n` +
      `│ ${p}بنك إيداع [الكمية] - إيداع الأموال 💰\n` +
      `│ ${p}بنك سحب [الكمية] - سحب الأموال 💵\n` +
      `│ ${p}بنك رصيدي - رصيدك الحالي 💳\n` +
      `│ ${p}بنك الفائدة - المطالبة بالفوائد 💹\n` +
      `│ ${p}بنك تحويل [الكمية] [آيدي] - تحويل الأموال 💸\n` +
      `│ ${p}بنك توب - أغنى 10 أشخاص 🏆\n` +
      `│ ${p}بنك قرض [الكمية] - اقتراض الأموال 🏦\n` +
      `│ ${p}بنك دفع_القرض [الكمية] - سداد القرض ✅`
    );
  }
};