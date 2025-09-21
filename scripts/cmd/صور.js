const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "صور", 
    aliases: ["بنترست"], 
    version: "1.2", 
    author: "حسين يعقوبي", 
    role: 0,
    countDown: 0,
    description: "ابحث عن الصور في بنترست",
    category: "وسائط", 
    guide: {
      ar: "{prefix}صور <الكلمة المراد البحث عنها> -<عدد الصور المطلوبة>"
    }
  }, 

  onStart: async function({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      if (!keySearch) {
        return api.sendMessage(
`▸ ◉ خطأ في الإدخال
│ يرجى كتابة الكلمة المراد البحث عنها وعدد الصور بالشكل التالي:
▸ ${this.config.guide.ar}`, 
          event.threadID, 
          event.messageID
        );
      }

      const keySearchs = keySearch.includes('-') ? keySearch.substr(0, keySearch.indexOf('-')).trim() : keySearch;
      const numberSearch = keySearch.includes('-') ? parseInt(keySearch.split("-").pop().trim()) || 4 : 4;

      await api.sendMessage(`▸ ◉ 🌐 جارٍ البحث عن الصور: "${keySearchs}"...`, event.threadID);

      const res = await axios.get(`https://pinterest-ashen.vercel.app/api?search=${encodeURIComponent(keySearchs)}`);
      const data = res.data.data || [];
      if (!data.length) return api.sendMessage(`▸ ◉ ❌ لم يتم العثور على صور للكلمة: "${keySearchs}"`, event.threadID);

      const imgData = [];
      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imgResponse = await axios.get(data[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(__dirname, 'tmp', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({
        body: `▸ ◉ نتائج البحث عن الصور: "${keySearchs}"
│ تم العثور على ${imgData.length} صور
▸ يمكنك تعديل الرقم بعد - لتحديد عدد الصور المطلوبة`,
        attachment: imgData
      }, event.threadID, event.messageID);

      await fs.remove(path.join(__dirname, 'tmp'));

    } catch (error) {
      console.error(error);
      return api.sendMessage(
`▸ ◉ حدث خطأ أثناء البحث
│ يرجى كتابة البحث بالشكل الصحيح مثل:
▸ ${this.config.guide.ar}`, 
        event.threadID, 
        event.messageID
      );
    }
  }
};