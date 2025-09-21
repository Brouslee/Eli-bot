const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ------------------- سكرب التحميل -------------------
async function getDownloadUrl(url, format = "mp3") {
  const encoded = encodeURIComponent(url);
  const options = { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } };

  try {
    const ff = format === "mp3" ? "mp3" : "480";
    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?button=1&start=1&end=1&format=${ff}&iframe_source=https://www.y2down.app,&url=${encoded}`,
      { ...options, timeout: 15000 }
    );
    
    const jsn1 = res.data;
    const prgsurl = jsn1.progress_url;
    const title = jsn1.title;
    const durationSec = jsn1.duration || 0; // مدة الفيديو بالثواني

    if (!prgsurl) throw new Error("No progress URL found.");
    if (durationSec > 480) throw new Error("الفيديو طويل جدًا (>8 دقائق)");

    let attempts = 0;
    const maxAttempts = 45;

    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
      try {
        const prgsRes = await axios.get(prgsurl, { ...options, timeout: 10000 });
        const prgsJson = prgsRes.data;

        if (prgsJson.success === 1 && prgsJson.progress === 1000 && prgsJson.download_url) {
          return { downloadUrl: prgsJson.download_url, title, durationSec };
        }
      } catch {}
    }
    
    throw new Error("انتهت مهلة الانتظار");
  } catch (err) {
    throw new Error(`فشل السكراب: ${err.message}`);
  }
}

// دالة تحميل الملف
async function dipto(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
    fs.writeFileSync(pathName, Buffer.from(response.data));
    if (fs.statSync(pathName).size === 0) throw new Error("الملف المحمل فارغ");
    return fs.createReadStream(pathName);
  } catch (err) {
    if (fs.existsSync(pathName)) fs.unlinkSync(pathName);
    throw new Error("فشل تحميل الملف: " + err.message);
  }
}

// ------------------- البحث عن الفيديو -------------------
const YOUTUBE_API_KEY = "AIzaSyAWm0X0v3CXx-c4oF695w3Tza-fgsUdJCw";

module.exports = {
  config: {
    name: "سمعيني",
    aliases: ["automp3", "شغلي"],
    version: "1.1",
    shortDescription: "تحميل أول نتيجة MP3 من يوتيوب مباشرة مع التحقق من المدة",
    guide: "{pn} <اسم الفيديو> → تحميل أول نتيجة MP3 تلقائيًا"
  },

  onStart: async function({ message, event, args }) {
    if (event.senderID === global.botID) return;

    const query = args.join(" ");
    if (!query) return message.reply("⚠️ أرسل اسم الفيديو الذي تريد تحميله");

    try {
      // البحث على يوتيوب
      const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: { part: "snippet", type: "video", maxResults: 1, q: query, key: YOUTUBE_API_KEY }
      });

      const items = res.data.items;
      if (!items || items.length === 0) return message.reply(`❌ لم يتم العثور على نتائج لـ: ${query}`);

      const video = items[0];
      const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      const videoTitle = video.snippet.title;

      // الحصول على مدة الفيديو من API يوتيوب
      const durRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: { part: "contentDetails", id: video.id.videoId, key: YOUTUBE_API_KEY }
      });
      const durationISO = durRes.data.items[0].contentDetails.duration; // صيغة ISO 8601
      const durationSec = isoDurationToSeconds(durationISO);

      if (durationSec > 480) return message.reply(`❌ الفيديو طويل جدًا (>8 دقائق)، تم إلغاء التحميل.`);

      const durationMin = Math.floor(durationSec / 60);
      const durationRem = durationSec % 60;
      await message.reply(`⏳ جاري تحميل الفيديو...\n🎵 العنوان: ${videoTitle}\n⏱ المدة: ${pad(durationMin)}:${pad(durationRem)}`);

      // تحميل الفيديو كـ MP3
      const result = await getDownloadUrl(videoUrl, "mp3");
      const pathFile = path.join(__dirname, `cache/mp3_${Date.now()}.mp3`);
      await dipto(result.downloadUrl, pathFile);

      await message.reply({
        body: `✅ تم التحميل بنجاح\n🎵 العنوان: ${result.title}\n📁 النوع: MP3`,
        attachment: fs.createReadStream(pathFile)
      });

      if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);

    } catch (err) {
      console.error("خطأ:", err.message);
      return message.reply(`❌ فشل تحميل الفيديو\n❗ تفاصيل الخطأ: ${err.message}`);
    }
  }
};

// تحويل مدة ISO 8601 لثواني
function isoDurationToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// إضافة دالة pad
function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}