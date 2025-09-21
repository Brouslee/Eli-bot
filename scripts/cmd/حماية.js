const { getStreamFromURL, uploadImgbb } = global.utils;
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, 'antiProtection.json');

module.exports = {
  config: {
    name: "حماية_المجموعة",
    aliases: ["حماية", "مانع"],
    version: "2.1",
    author: "sifo anter - تعديل وترجمة Yuki",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "تشغيل أو إيقاف الحمايات الخاصة بالمجموعة" },
    category: "إدارة المجموعة",
    guide: { ar:
`   {pn} صورة [تشغيل | إيقاف]: منع تغيير صورة المجموعة
   {pn} اسم [تشغيل | إيقاف]: منع تغيير اسم المجموعة
   {pn} لقب [تشغيل | إيقاف]: منع تغيير الألقاب
   {pn} ثيم [تشغيل | إيقاف]: منع تغيير الثيم
   {pn} رمز [تشغيل | إيقاف]: منع تغيير الرموز التعبيرية
   {pn} الكل تشغيل: لتفعيل جميع الحمايات دفعة واحدة`
    }
  },

  langs: {
    ar: {
      allEnabled: "▸ ◉ تم تفعيل جميع الحمايات:\n│ ⫸ صورة المجموعة\n│ ⫸ اسم المجموعة\n│ ⫸ الألقاب\n│ ⫸ الثيم\n│ ⫸ الرمز التعبيري\n▸ الحماية جاهزة الآن",
      antiChangeAvatarOn: "▸ ◉ تم تفعيل حماية تغيير صورة المجموعة\n│ الحماية جاهزة الآن",
      antiChangeAvatarOff: "▸ ◉ تم إيقاف حماية تغيير صورة المجموعة\n│ الحماية جاهزة الآن",
      missingAvt: "▸ ◉ لم يتم تعيين صورة للمجموعة",
      antiChangeNameOn: "▸ ◉ تم تفعيل حماية تغيير اسم المجموعة\n│ الحماية جاهزة الآن",
      antiChangeNameOff: "▸ ◉ تم إيقاف حماية تغيير اسم المجموعة\n│ الحماية جاهزة الآن",
      antiChangeNicknameOn: "▸ ◉ تم تفعيل حماية الألقاب داخل المجموعة\n│ الحماية جاهزة الآن",
      antiChangeNicknameOff: "▸ ◉ تم إيقاف حماية الألقاب داخل المجموعة\n│ الحماية جاهزة الآن",
      antiChangeThemeOn: "▸ ◉ تم تفعيل حماية تغيير الثيم\n│ الحماية جاهزة الآن",
      antiChangeThemeOff: "▸ ◉ تم إيقاف حماية تغيير الثيم\n│ الحماية جاهزة الآن",
      antiChangeEmojiOn: "▸ ◉ تم تفعيل حماية تغيير الرموز التعبيرية\n│ الحماية جاهزة الآن",
      antiChangeEmojiOff: "▸ ◉ تم إيقاف حماية تغيير الرموز التعبيرية\n│ الحماية جاهزة الآن",
      antiChangeAvatarAlreadyOn: "▸ ⚠️ حماية صورة المجموعة مفعلة مسبقًا",
      antiChangeNameAlreadyOn: "▸ ⚠️ حماية اسم المجموعة مفعلة مسبقًا",
      antiChangeNicknameAlreadyOn: "▸ ⚠️ حماية الألقاب مفعلة مسبقًا",
      antiChangeThemeAlreadyOn: "▸ ⚠️ حماية الثيم مفعلة مسبقًا",
      antiChangeEmojiAlreadyOn: "▸ ⚠️ حماية الرموز مفعلة مسبقًا"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang }) {
    const { threadID } = event;
    const command = args[0];
    const action = args[1];
    if (!command || (!["تشغيل","إيقاف"].includes(action) && command !== "الكل")) return message.SyntaxError();

    const dataAnti = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf-8')) : {};
    dataAnti[threadID] = dataAnti[threadID] || {};

    async function checkAndSaveData(key, value) {
      if (action === "إيقاف") delete dataAnti[threadID][key];
      else dataAnti[threadID][key] = value;

      fs.writeFileSync(dataFile, JSON.stringify(dataAnti, null, 2));
      const replyKey = `antiChange${key[0].toUpperCase()}${key.slice(1)}${action === "تشغيل" ? "On" : "Off"}`;
      message.reply(getLang(replyKey));
    }

    if (command === "الكل" && action === "تشغيل") {
      const { imageSrc, threadName, members, threadThemeID, emoji } = await threadsData.get(threadID);
      if (imageSrc) dataAnti[threadID].avatar = (await uploadImgbb(imageSrc)).image.url;
      dataAnti[threadID].name = threadName;
      dataAnti[threadID].nickname = members.reduce((acc,u)=>({...acc,[u.userID]:u.nickname}), {});
      dataAnti[threadID].theme = threadThemeID;
      dataAnti[threadID].emoji = emoji;
      fs.writeFileSync(dataFile, JSON.stringify(dataAnti, null, 2));
      return message.reply(getLang("allEnabled"));
    }

    switch(command){
      case "صورة": {
        const { imageSrc } = await threadsData.get(threadID);
        if(!imageSrc) return message.reply(getLang("missingAvt"));
        const newImage = await uploadImgbb(imageSrc);
        await checkAndSaveData("avatar", newImage.image.url);
        break;
      }
      case "اسم": {
        const { threadName } = await threadsData.get(threadID);
        await checkAndSaveData("name", threadName);
        break;
      }
      case "لقب": {
        const { members } = await threadsData.get(threadID);
        const nicknames = members.reduce((acc,u)=>({...acc,[u.userID]:u.nickname}), {});
        await checkAndSaveData("nickname", nicknames);
        break;
      }
      case "ثيم": {
        const { threadThemeID } = await threadsData.get(threadID);
        await checkAndSaveData("theme", threadThemeID);
        break;
      }
      case "رمز": {
        const { emoji } = await threadsData.get(threadID);
        await checkAndSaveData("emoji", emoji);
        break;
      }
      default: return message.SyntaxError();
    }
  },

  onEvent: async function ({ message, event, threadsData, role, api, getLang }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const dataAnti = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile,'utf-8')) : {};
    const botID = api.getCurrentUserID();
    const threadData = dataAnti[threadID] || {};
    const isAdminChange = role < 1 && botID !== author;

    const replyIfChanged = async (type, oldValue, setFn) => {
      if(!oldValue) return;
      if(isAdminChange){
        message.reply(getLang(`antiChange${type}AlreadyOn`));
        setFn(oldValue);
      } else {
        setFn(logMessageData[type.toLowerCase()]);
      }
    };

    switch(logMessageType){
      case "log:thread-image":
        await replyIfChanged("Avatar", threadData.avatar, url => api.changeGroupImage(getStreamFromURL(url), threadID));
        break;
      case "log:thread-name":
        await replyIfChanged("Name", threadData.name, name => api.setTitle(name, threadID));
        break;
      case "log:user-nickname":
        const { participant_id, nickname } = logMessageData;
        if(threadData.nickname && isAdminChange){
          message.reply(getLang("antiChangeNicknameAlreadyOn"));
          api.changeNickname(threadData.nickname[participant_id], threadID, participant_id);
        } else {
          await threadsData.set(threadID, nickname, `data.antiChangeInfoBox.nickname.${participant_id}`);
        }
        break;
      case "log:thread-color":
        await replyIfChanged("Theme", threadData.theme, theme => api.changeThreadColor(theme, threadID));
        break;
      case "log:thread-icon":
        await replyIfChanged("Emoji", threadData.emoji, emoji => api.changeThreadEmoji(emoji, threadID));
        break;
    }
  }
};