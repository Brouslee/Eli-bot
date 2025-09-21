const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  threadStates: {},
  config: {
    name: 'تلقائي (تحميل بصمت)',
    version: '2.3',
    author: 'Kaizenji + تعديل GPT',
    countDown: 5,
    role: 0,
    shortDescription: 'تحميل تلقائي للفيديوهات/ريلز/أوديو بصمت',
    longDescription: { ar: 'تحميل تلقائي من فيسبوك، تويتر، تيك توك، انستغرام، يوتيوب، سبوتيفاي' },
    category: 'المطور',
    guide: '{p}{n}'
  },

  onStart: async function ({ event }) {
    const threadID = event.threadID;
    if (!this.threadStates[threadID]) this.threadStates[threadID] = {};
    console.log(`[INFO] التلقائي شغال للـ Thread: ${threadID}`);
  },

  onChat: async function ({ api, event }) {
    const { body } = event;
    const link = this.extractLink(body);
    if (link) await this.downLoad(link, api, event);
  },

  extractLink: function (message) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const link = message.match(urlRegex);
    return link ? link[0] : null;
  },

  downLoad: async function (url, api, event) {
    try {
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      let BASE_URL;
      if (url.includes("facebook.com")) BASE_URL = `https://www.samirxpikachu.run.place/fbdl?vid_url=${encodeURIComponent(url)}`;
      else if (url.includes("twitter.com")) BASE_URL = `https://www.samirxpikachu.run.place/twitter?url=${encodeURIComponent(url)}`;
      else if (url.includes("tiktok.com")) BASE_URL = `https://www.samirxpikachu.run.place/tiktok?url=${encodeURIComponent(url)}`;
      else if (url.includes("instagram.com")) BASE_URL = `https://www.samirxpikachu.run.place/igdl?url=${encodeURIComponent(url)}`;
      else if (url.includes("open.spotify.com")) BASE_URL = `https://www.samirxpikachu.run.place/spotifydl?url=${encodeURIComponent(url)}`;
      else if (url.includes("youtube.com") || url.includes("youtu.be")) BASE_URL = `https://www.samirxpikachu.run.place/ytdl?url=${encodeURIComponent(url)}`;
      else return;

      const res = await axios.get(BASE_URL);

      let fileUrl, fileExt = "mp4";

      if (url.includes("facebook.com")) fileUrl = res.data.links?.["Download High Quality"];
      else if (url.includes("twitter.com")) fileUrl = res.data.HD;
      else if (url.includes("tiktok.com")) fileUrl = res.data.hdplay;
      else if (url.includes("instagram.com")) {
        if (Array.isArray(res.data.url) && res.data.url.length > 0) {
          const mp4Obj = res.data.url.find(o => o.type === 'mp4');
          if (mp4Obj) fileUrl = mp4Obj.url;
        }
      } else if (url.includes("spotify.com")) {
        const audioUrl = res.data.link;
        const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        const filePath = path.join(tmpDir, 'spotify.mp3');
        fs.writeFileSync(filePath, Buffer.from(audioRes.data));
        await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID);
        fs.unlinkSync(filePath);
        return;
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        fileUrl = res.data.link || url;
      }

      if (fileUrl) {
        const videoRes = await axios.get(fileUrl, { responseType: "stream" });
        const filePath = path.join(tmpDir, `${Date.now()}.${fileExt}`);
        const writer = fs.createWriteStream(filePath);
        videoRes.data.pipe(writer);
        writer.on("finish", async () => {
          await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID);
          fs.unlinkSync(filePath);
        });
      }
    } catch (e) {
      console.error(`[ERROR] فشل التحميل: ${e.message}`);
    }
  }
};