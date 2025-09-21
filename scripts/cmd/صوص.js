const axios = require('axios');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

module.exports = {
  config: {
    name: "شسمه",
    aliases: ["sauce","صلصة", "صوص"],
    version: "1.7.1",
    author: "xAI Grok",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "تحديد اسم الأنمي من صورة مع بوستر عالي الجودة والقصة"
    },
    category: "البحث",
    guide: {
      ar: "اسم_الانمي <رابط_الصورة> أو رد على صورة"
    }
  },

  langs: {
    ar: {
      missingUrl: `▸ ◉ ⚠️ يرجى إدخال رابط الصورة أو الرد على صورة 🔍`,
      searching: `▸ ◉ 🌐 جاري البحث عن الأنمي من الصورة...`,
      noResults: `▸ ◉ ❌ لم يتم العثور على نتائج للصورة المقدمة`,
      error: `▸ ◉ ❌ حدث خطأ أثناء معالجة الصورة: %1`
    }
  },

  seasonTranslations: {
    "WINTER": "شتاء",
    "SPRING": "ربيع",
    "SUMMER": "صيف",
    "FALL": "خريف"
  },

  genreTranslations: {
    "Comedy": "كوميدي",
    "Romance": "رومانسي",
    "Action": "أكشن",
    "Adventure": "مغامرات",
    "Drama": "دراما",
    "Fantasy": "فانتازيا",
    "Sci-Fi": "خيال علمي",
    "Horror": "رعب",
    "Mystery": "غموض",
    "Slice of Life": "شريحة من الحياة"
    // يمكنك إضافة بقية التصنيفات حسب الحاجة
  },

  statusTranslations: {
    "FINISHED": "مكتمل",
    "RELEASING": "قيد العرض",
    "NOT_YET_RELEASED": "لم يتم عرضه بعد",
    "CANCELLED": "ملغي",
    "HIATUS": "متوقف مؤقتاً"
  },

  cleanDescription: function(description) {
    if (!description) return "غير متوفر";
    let cleaned = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 500) cleaned = cleaned.substring(0, 500) + '...';
    return cleaned || "غير متوفر";
  },

  async translateToArabic(text) {
    if (!text || text === "غير متوفر") return "غير متوفر";
    try {
      const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
        params: { client: 'gtx', sl: 'en', tl: 'ar', dt: 't', q: text }, timeout: 10000
      });
      return response.data?.[0]?.[0]?.[0] || text;
    } catch (error) { return text; }
  },

  onStart: async function({ message, args, getLang, event }) {
    try {
      let imageData = null;
      if (event.type === "message_reply" && event.messageReply.attachments?.[0]?.type === "photo") {
        const url = event.messageReply.attachments[0].url;
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        imageData = res.data;
      } else if (args[0]) {
        const res = await axios.get(args[0], { responseType: 'arraybuffer' });
        imageData = res.data;
      } else return message.reply(getLang("missingUrl"));

      await message.reply(getLang("searching"));

      const traceRes = await axios.post("https://api.trace.moe/search?anilistInfo", imageData, {
        headers: { "Content-Type": "image/jpeg" },
        params: { cutBorders: true }
      });

      const result = traceRes.data.result?.[0];
      if (!result) return message.reply(getLang("noResults"));

      const anilistId = result.anilist?.id;
      let romaji = "غير معروف", english = "غير معروف", native = "غير معروف";
      let season = "غير معروف", year = "", genres = "غير معروف", coverImageUrl = null;
      let description = "غير متوفر", episodes = "غير معروف", status = "غير معروف", score = "غير معروف";

      if (anilistId) {
        const query = `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              title { romaji english native }
              description
              season
              seasonYear
              genres
              episodes
              status
              averageScore
              coverImage { extraLarge }
            }
          }`;
        const variables = { id: anilistId };
        const aniRes = await axios.post("https://graphql.anilist.co", { query, variables }, {
          headers: { "Content-Type": "application/json" }
        });
        const anime = aniRes.data.data.Media;
        romaji = anime.title.romaji || romaji;
        english = anime.title.english || english;
        native = anime.title.native || native;
        description = await this.translateToArabic(this.cleanDescription(anime.description));
        season = anime.season ? this.seasonTranslations[anime.season.toUpperCase()] || anime.season : season;
        year = anime.seasonYear ? anime.seasonYear.toString() : "";
        genres = anime.genres.length ? anime.genres.map(g => this.genreTranslations[g] || g).join(" - ") : genres;
        episodes = anime.episodes ? anime.episodes.toString() : "غير معروف";
        status = anime.status ? this.statusTranslations[anime.status] || anime.status : status;
        score = anime.averageScore ? `${anime.averageScore}/100` : score;
        coverImageUrl = anime.coverImage.extraLarge || null;
      }

      const episode = result.episode || "غير معروف";
      const time = result.from ? Math.floor(result.from / 60) + ":" + (Math.floor(result.from % 60)).toString().padStart(2, '0') : "غير معروف";

      const replyMessage =
`▸ ◉ الأنمي
│ الاسم (Romaji): ${romaji}
│ الاسم (EN): ${english}
│ الاسم (الياباني): ${native}

▸ 📝 القصة:
│ ${description}

▸ 📊 التفاصيل:
│ الموسم: ${season} ${year}
│ التصنيفات: ${genres}
│ عدد الحلقات: ${episodes}
│ الحالة: ${status}
│ التقييم: ${score}

▸ 🎯 من الصورة:
│ الحلقة: ${episode}
│ الدقيقة: ${time}`;

      if (coverImageUrl) {
        const imgPath = path.join(__dirname, `poster_${anilistId}.jpg`);
        try {
          const imageRes = await axios.get(coverImageUrl, { responseType: "stream", timeout: 15000 });
          const writer = fs.createWriteStream(imgPath);
          imageRes.data.pipe(writer);
          await new Promise((resolve, reject) => { writer.on("finish", resolve); writer.on("error", reject); });
          const attachment = fs.createReadStream(imgPath);
          await message.reply({ body: replyMessage, attachment });
          setTimeout(async () => { await fsp.unlink(imgPath); }, 5000);
        } catch {
          await message.reply(replyMessage);
        }
      } else await message.reply(replyMessage);

    } catch (err) {
      return message.reply(getLang("error", err.message));
    }
  }
};