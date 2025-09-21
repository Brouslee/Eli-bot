const fast = require('fast-speedtest-api');

module.exports = {
  config: {
    name: "اختبار",
    aliases: ["speed"],
    version: "1.0",
    author: "Samir",
    countDown: 30,
    role: 2,
    shortDescription: "▸ ◉ قم بتفقد سرعة النظام",
    longDescription: "▸ ◉ التحقق من سرعة النظام بدقة وسهولة",
    category: "إدارة البوت",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const speedTest = new fast({
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
        verbose: false,
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
        unit: fast.UNITS.Mbps
      });

      const result = await speedTest.getSpeed();

      const message = `▸ ◉ اختبار سرعة البوت
│ تم اختبار سرعة معالجة البوت بنجاح
▸ ◉ النتيجة
│ السرعة: ${result} ميغابايت في الثانية`;

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error('حدث خطأ:', error);
      return api.sendMessage("▸ ◉ خطأ\n│ حدث خطأ أثناء اختبار السرعة", event.threadID, event.messageID);
    }
  }
};