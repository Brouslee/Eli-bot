const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "معلومات",
    aliases: ['boxinfo'],
    version: "1.0",
    author: "Loid Butter",
    countDown: 5,
    role: 0,
    shortDescription: "أنظر إلى كل معلومات المجموعة",
    longDescription: "أنظر إلى كل معلومات المجموعة",
    category: "أدوات",
    guide: {
      en: "{p} [معلومات_حول_المجموعة|معلومات_حول]",
    }
  },

  onStart: async function ({ api, event, args }) {
    let threadInfo = await api.getThreadInfo(event.threadID);
    const threadMem = threadInfo.participantIDs.length;

    let gendernam = [];
    let gendernu = [];
    let nope = [];

    for (let z in threadInfo.userInfo) {
      const gioitinhone = threadInfo.userInfo[z].gender;
      const nName = threadInfo.userInfo[z].name;
      if (gioitinhone === "MALE") gendernam.push(nName);
      else if (gioitinhone === "FEMALE") gendernu.push(nName);
      else nope.push(nName);
    }

    const nam = gendernu.length;
    const nu = gendernam.length;

    let listAdmins = '';
    const qtv2 = threadInfo.adminIDs;
    const qtv = qtv2.length;

    for (let i = 0; i < qtv2.length; i++) {
      const infu = (await api.getUserInfo(qtv2[i].id));
      const name = infu[qtv2[i].id].name;
      listAdmins += `▸ ${name}\n`;
    }

    const sex = threadInfo.approvalMode;
    const pd = sex === false ? 'تم تشغيل الموافقة' : sex === true ? 'تم تعطيل الموافقة' : 'غير معروف';

    const threadName = threadInfo.threadName;
    const id = threadInfo.threadID;
    const sl = threadInfo.messageCount;
    const icon = threadInfo.emoji;

    const callback = () =>
      api.sendMessage(
        {
          body: `▸ ◉ معلومات المجموعة
│ الاسم: ${threadName}
│ الآيدي: ${id}
│ الموافقة: ${pd}
│ الإيموجي: ${icon}
│ إجمالي الأعضاء: ${threadMem}
│ عدد الإناث: ${nam}
│ عدد الذكور: ${nu}
│ إجمالي المسؤولين: ${qtv}
▸ ◉ قائمة المسؤولين:
${listAdmins}▸ ◉ إجمالي الرسائل: ${sl} رسالة`,
          attachment: fs.createReadStream(__dirname + '/cache/1.png')
        },
        event.threadID,
        () => fs.unlinkSync(__dirname + '/cache/1.png'),
        event.messageID
      );

    return request(encodeURI(`${threadInfo.imageSrc}`))
      .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
      .on('close', () => callback());
  }
};