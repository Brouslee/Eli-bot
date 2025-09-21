module.exports = {
  config: {
    name: "نبذة",
    aliases: ["انمي", "غلاف-انمي"],
    version: "1.1.0",
    author: "Mikey + تعديل SIFOANTER",
    shortDescription: "جلب غلاف أنمي ومعلومات مفصلة مع القصة بالعربية",
    longDescription: "يبحث عن أنمي بالاسم ويرسل صورة الغلاف مع تفاصيل كاملة + القصة مترجمة للعربية",
    category: "الوسائط",
    guide: {
      ar: "نبذة <اسم الأنمي>\nمثال: نبذة ناروتو\nإذا تعددت النتائج: اختر بالرد برقم"
    }
  },
  langs: {
    ar: {
      askName: "▸ ◉ اكتب اسم الأنمي اللي تبيه:",
      searching: "▸ ◉ نبحث على: %1...",
      notFound: "▸ ◉ ما لقينا نتائج للبحث: %1",
      chooseHeader: "▸ ◉ لقينا %1 نتائج، هذه القائمة:",
      chooseList: "%1\n\n│ ردّ برقم من 1 إلى %2 لاختيار الأنمي",
      invalidNumber: "▸ ◉ رقم غير صالح\n│ اختَر بين 1 و%1",
      notAllowed: "▸ ◉ هذا الردّ مخصّص للي استعمل الأمر فقط",
      preparing: "▸ ◉ نجهّز الغلاف والمعلومات...",
      detail: "📌 العنوان: %1\n🎌 اليابانية: %2\n📺 النوع: %3\n📡 الحالة: %4\n🗓 العرض الأول: %5\n⏰ الإذاعة: %6\n📅 البث: %7\n🎬 المنتجين: %8\n🏢 الاستوديو: %9\n📖 المصدر: %10\n🎞 الحلقات: %11\n⏳ المدة: %12\n🏷 الأنواع: %13\n🔥 الشعبية: %14\n⭐ التصنيف: %15\n💯 النتيجة: %16\n🔞 التقييم: %17",
      synopsisBlock: "\n🧾 القصة:\n%1",
      unknown: "غير معروف",
      none: "لا يوجد",
      error: "▸ ◉ صار خطأ أثناء الجلب\n│ جرّب من بعد"
    }
  },
  onStart: async function({ message, event, args, getLang }) {
    const axios = require("axios");
    const query = (args || []).join(" ").trim();
    if (!query) {
      const sent = await message.reply(getLang("askName"));
      return global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        type: "askName",
        author: event.senderID,
        messageID: sent.messageID
      });
    }
    await message.reply(getLang("searching", query));
    try {
      const { data } = await axios.get("https://api.jikan.moe/v4/anime", {
        params: { q: query, limit: 5, sfw: true },
        timeout: 20000
      });
      const results = Array.isArray(data?.data) ? data.data : [];
      if (!results.length) return message.reply(getLang("notFound", query));
      if (results.length === 1) {
        return sendDetail(results[0], message, getLang);
      } else {
        const list = results.map((a, i) => {
          const title = a.title || getLang("unknown");
          const year = a.year || (a.aired?.prop?.from?.year || getLang("unknown"));
          const type = a.type || getLang("unknown");
          const score = typeof a.score === "number" ? a.score.toFixed(1) : getLang("unknown");
          return `${i + 1}. ${title} • ${type} • ${year} • ⭐ ${score}`;
        }).join("\n");
        const prompt = await message.reply(
          getLang("chooseHeader", results.length) + "\n" +
          getLang("chooseList", list, results.length)
        );
        global.GoatBot.onReply.set(prompt.messageID, {
          commandName: this.config.name,
          type: "choose",
          author: event.senderID,
          results,
          messageID: prompt.messageID
        });
      }
    } catch {
      return message.reply(getLang("error"));
    }

    async function sendDetail(anime, message, getLang) {
      const axios = require("axios");
      await message.reply(getLang("preparing"));
      try {
        const unk = getLang("unknown");
        const none = getLang("none");
        const title = anime.title || unk;
        const jp = anime.title_japanese || unk;
        const type = anime.type || unk;
        const status = anime.status || unk;
        const premier = formatPremier(anime.season, anime.year, unk);
        const broadcast = anime.broadcast?.string || formatBroadcast(anime.broadcast) || unk;
        const aired = anime.aired?.string || unk;
        const producers = formatList(anime.producers, none);
        const studios = formatList(anime.studios, none);
        const source = anime.source || unk;
        const episodes = typeof anime.episodes === "number" ? String(anime.episodes) : unk;
        const duration = anime.duration || unk;
        const genres = formatGenres(anime, none);
        const popularity = typeof anime.popularity === "number" ? String(anime.popularity) : unk;
        const rank = typeof anime.rank === "number" ? `#${anime.rank}` : unk;
        const score = typeof anime.score === "number" ? anime.score.toFixed(1) : unk;
        const rating = anime.rating || unk;

        let synopsis = (anime.synopsis || "").trim();
        if (!synopsis) synopsis = getLang("unknown");
        let ar = synopsis === getLang("unknown") ? synopsis : await translateText(synopsis, "ar");
        if (ar && ar.length > 1200) ar = ar.slice(0, 1200).trim() + " ...";

        const info = getLang("detail",
          title,
          jp,
          type,
          status,
          premier,
          broadcast,
          aired,
          producers,
          studios,
          source,
          episodes,
          duration,
          genres,
          popularity,
          rank,
          score,
          rating
        );
        const body = info + getLang("synopsisBlock", ar);

        const img = anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url;
        if (img) {
          const pic = await axios.get(img, { responseType: "stream", timeout: 20000 });
          return message.reply({ body, attachment: pic.data });
        } else {
          return message.reply(body);
        }
      } catch {
        return message.reply(getLang("error"));
      }
    }

    function formatPremier(season, year, unk) {
      if (!season && !year) return unk;
      const map = { winter: "شتاء", spring: "ربيع", summer: "صيف", fall: "خريف" };
      const s = season ? (map[String(season).toLowerCase()] || season) : "";
      if (s && year) return `${s} ${year}`;
      return String(year || s || unk);
    }
    function formatBroadcast(bc) {
      if (!bc) return "";
      const parts = [];
      if (bc.day) parts.push(bc.day);
      if (bc.time) parts.push(bc.time);
      if (bc.timezone) parts.push(bc.timezone);
      return parts.join(" ");
    }
    function formatList(arr, none) {
      if (!Array.isArray(arr) || !arr.length) return none;
      return arr.map(x => x?.name).filter(Boolean).join(", ");
    }
    function formatGenres(anime, none) {
      const getNames = (a) => (Array.isArray(a) ? a.map(x => x?.name).filter(Boolean) : []);
      const out = [...getNames(anime.genres), ...getNames(anime.themes), ...getNames(anime.demographics)];
      return out.length ? out.join(", ") : none;
    }
  },
  onReply: async function({ message, event, Reply, getLang }) {
    if (!Reply || !Reply.type) return;
    if (event.senderID !== Reply.author) return message.reply(getLang("notAllowed"));
    const axios = require("axios");
    if (Reply.type === "askName") {
      const query = (event.body || "").trim();
      if (!query) return;
      try {
        await message.reply(getLang("searching", query));
        const { data } = await axios.get("https://api.jikan.moe/v4/anime", {
          params: { q: query, limit: 5, sfw: true },
          timeout: 20000
        });
        const results = Array.isArray(data?.data) ? data.data : [];
        if (!results.length) return message.reply(getLang("notFound", query));
        if (results.length === 1) {
          return sendDetail(results[0]);
        } else {
          const list = results.map((a, i) => {
            const title = a.title || getLang("unknown");
            const year = a.year || (a.aired?.prop?.from?.year || getLang("unknown"));
            const type = a.type || getLang("unknown");
            const score = typeof a.score === "number" ? a.score.toFixed(1) : getLang("unknown");
            return `${i + 1}. ${title} • ${type} • ${year} • ⭐ ${score}`;
          }).join("\n");
          const prompt = await message.reply(
            getLang("chooseHeader", results.length) + "\n" +
            getLang("chooseList", list, results.length)
          );
          global.GoatBot.onReply.set(prompt.messageID, {
            commandName: "نبذة",
            type: "choose",
            author: event.senderID,
            results,
            messageID: prompt.messageID
          });
        }
      } catch {
        return message.reply(getLang("error"));
      }
    } else if (Reply.type === "choose") {
      const n = parseInt((event.body || "").trim(), 10);
      if (isNaN(n) || n < 1 || n > Reply.results.length) return message.reply(getLang("invalidNumber", Reply.results.length));
      const anime = Reply.results[n - 1];
      try {
        await message.reply(getLang("preparing"));
        // إعادة استخدام sendDetail
        return await (async function(anime) {
          const axios = require("axios");
          const unk = getLang("unknown");
          const none = getLang("none");
          const title = anime.title || unk;
          const jp = anime.title_japanese || unk;
          const type = anime.type || unk;
          const status = anime.status || unk;
          const premier = (function(season, year) {
            const map = { winter: "شتاء", spring: "ربيع", summer: "صيف", fall: "خريف" };
            if (!season && !year) return unk;
            const s = season ? (map[String(season).toLowerCase()] || season) : "";
            if (s && year) return `${s} ${year}`;
            return String(year || s || unk);
          })(anime.season, anime.year);
          const broadcast = anime.broadcast?.string || (function(bc) {
            if (!bc) return "";
            const parts = [];
            if (bc.day) parts.push(bc.day);
            if (bc.time) parts.push(bc.time);
            if (bc.timezone) parts.push(bc.timezone);
            return parts.join(" ");
          })(anime.broadcast) || unk;
          const aired = anime.aired?.string || unk;
          const producers = (function(arr) {
            if (!Array.isArray(arr) || !arr.length) return none;
            return arr.map(x => x?.name).filter(Boolean).join(", ");
          })(anime.producers);
          const studios = (function(arr) {
            if (!Array.isArray(arr) || !arr.length) return none;
            return arr.map(x => x?.name).filter(Boolean).join(", ");
          })(anime.studios);
          const source = anime.source || unk;
          const episodes = typeof anime.episodes === "number" ? String(anime.episodes) : unk;
          const duration = anime.duration || unk;
          const genres = (function(an) {
            const getNames = (a) => (Array.isArray(a) ? a.map(x => x?.name).filter(Boolean) : []);
            const out = [...getNames(an.genres), ...getNames(an.themes), ...getNames(an.demographics)];
            return out.length ? out.join(", ") : none;
          })(anime);
          const popularity = typeof anime.popularity === "number" ? String(anime.popularity) : unk;
          const rank = typeof anime.rank === "number" ? `#${anime.rank}` : unk;
          const score = typeof anime.score === "number" ? anime.score.toFixed(1) : unk;
          const rating = anime.rating || unk;

          let synopsis = (anime.synopsis || "").trim();
          if (!synopsis) synopsis = getLang("unknown");
          let ar = synopsis === getLang("unknown") ? synopsis : await translateText(synopsis, "ar");
          if (ar && ar.length > 1200) ar = ar.slice(0, 1200).trim() + " ...";

          const info = getLang("detail",
            title,
            jp,
            type,
            status,
            premier,
            broadcast,
            aired,
            producers,
            studios,
            source,
            episodes,
            duration,
            genres,
            popularity,
            rank,
            score,
            rating
          );
          const body = info + getLang("synopsisBlock", ar);

          const img = anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url;
          if (img) {
            const pic = await axios.get(img, { responseType: "stream", timeout: 20000 });
            await message.reply({ body, attachment: pic.data });
          } else {
            await message.reply(body);
          }
          if (Reply.messageID) global.GoatBot.onReply.delete(Reply.messageID);
        })(anime);
      } catch {
        return message.reply(getLang("error"));
      }
    }
  },
  onReaction: async function() {},
  onEvent: async function() {}
};

async function translateText(text, to) {
  const axios = require("axios");
  try {
    if (!text || !text.trim()) return "";
    const url = "https://translate.googleapis.com/translate_a/single";
    const { data } = await axios.get(url, {
      params: { client: "gtx", sl: "auto", tl: to, dt: "t", q: text },
      timeout: 15000
    });
    const parts = Array.isArray(data?.[0]) ? data[0].map(seg => seg[0]).join("") : "";
    return parts || text;
  } catch {
    return text;
  }
}