module.exports = {
  config: {
    name: "عمري",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    category: "خدمات",
    shortDescription: {
      ar: "▸ 🕒 يحسب عمرك تلقائيًا",
    },
  },

  onStart: async function ({ api, event, args }) {
    const birthday = args[0];

    if (!birthday) {
      return api.sendMessage(
`▸ ⚠️ | يرجى إدخال تاريخ ميلادك بصيغة السنة-الشهر-اليوم
│ مثال: 2000-05-23
▸ بعد إدخال التاريخ سأحسب عمرك تلقائيًا`, 
        event.threadID
      );
    }

    const currentDate = new Date();
    const birthDate = new Date(birthday);
    let age = currentDate.getFullYear() - birthDate.getFullYear();

    birthDate.setFullYear(currentDate.getFullYear());
    const isBeforeBirthday = currentDate < birthDate;

    const finalAge = isBeforeBirthday ? age - 1 : age;

    api.sendMessage(
`▸ ◉ حساب عمرك
│ تاريخ الميلاد: ${birthday}
▸ عمرك الحالي: ${finalAge} سنة
│ هل الحساب صحيح؟`, 
      event.threadID
    );
  },
};