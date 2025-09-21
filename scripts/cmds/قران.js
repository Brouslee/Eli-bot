const fetch = require('node-fetch');
const fs = require('fs');
const request = require('request');

async function getQuranVerse({ api, event, args }) {
  try {
    const surahRes = await fetch('https://api.quran.gading.dev/surah');
    const surahData = await surahRes.json();
    const surahs = surahData.data;

    let s1 = args[0];
    let s2 = args[1];

    if (!s1 || !s2) {
      return api.sendMessage(
        `▸ ◉ تعليمات استخدام الأمر
│ يمكنك كتابة الأمر مع تحديد رقم السورة والآية
│ مثال: {pn} 2 255
▸ ◉ ملاحظة
│ لو تريد آية محددة حدد رقم السورة ورقم الآية
│ مثال: {pn} 1 1`,
        event.threadID,
        event.messageID
      );
    }

    const url = `https://api.quran.gading.dev/surah/${s1}/${s2}`;
    const response = await fetch(url);
    const data = await response.json();

    const audioLink = data.data.audio.secondary[0];

    request({ url: audioLink, encoding: null }, function (error, response, body) {
      if (error) throw error;
      fs.writeFileSync(__dirname + '/cache/quran_aud.mp3', body);
      api.sendMessage(
        {
          body: `▸ ◉ القرآن الكريم
│ السورة: ${data.data.surah.name.transliteration.id}
│ الآية: ${s2}
│ النص: ${data.data.text.arab}`,
          attachment: fs.createReadStream(__dirname + `/cache/quran_aud.mp3`)
        },
        event.threadID,
        () => fs.unlinkSync(__dirname + `/cache/quran_aud.mp3`),
        event.messageID
      );
    });

  } catch (error) {
    console.error('حدث خطأ:', error);
    api.sendMessage(
      `▸ ◉ عذراً، حدث خطأ أثناء جلب الآية
│ يرجى المحاولة لاحقاً`,
      event.threadID,
      event.messageID
    );
  }
}

module.exports = {
  config: {
    name: "اية",
    version: "1.3",
    author: "حسين يعقوبي",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "يرسل آية قرآنية مع الصوت" },
    longDescription: { ar: "حدد رقم السورة والآية لإرسالها مع الصوت" },
    category: "إسلام",
    guide: { ar: "{pn} [رقم_السورة رقم_الآية]" }
  },
  onStart: getQuranVerse,
};