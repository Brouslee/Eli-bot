const axios = require("axios");

module.exports = {
  config: {
    name: "بريد",
    version: "1.0",
    author: "samir",
    countDown: 5,
    role: 2,
    shortDescription: "▸ احصل على البريد المؤقت خلال 10 دقائق",
    longDescription: "▸ إدارة البريد المؤقت بسرعة وسهولة",
    category: "المالك",
    guide: { ar: "{prefix}بريد <جديد|قائمة|المزيد|أحصل|تفقد>" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args[0] == "جديد") {
        const res = await axios.get(`https://10minutemail.net/address.api.php?new=1`);
        const user = res.data.mail_get_user;
        const host = res.data.mail_get_host;
        const time = res.data.mail_get_time;
        const stime = res.data.mail_server_time;
        const kmail = res.data.mail_get_key;
        const ltime = res.data.mail_left_time;
        const mid = res.data.mail_list[0]?.mail_id || "لا يوجد";
        const sub = res.data.mail_list[0]?.subject || "لا يوجد";
        const date = res.data.mail_list[0]?.datetime2 || "لا يوجد";

        return api.sendMessage(
`▸ ◉ البريد الجديد:
│ الإسم: ${user}
│ المضيف: ${host}
│ البريد: ${user}@${host} (.)com
│ الوقت: ${time}
│ وقت الخدمة: ${stime}
│ المفتاح: ${kmail}
│ وقت التذكير: ${ltime}s
│ آيدي البريد: ${mid}
│ المحتوى: ${sub}
│ التاريخ: ${date}`, event.threadID, event.messageID);

      } else if (args[0] == "قائمة") {
        const res = await axios.get(`https://www.phamvandienofficial.xyz/mail10p/domain`);
        const list = res.data.domain;
        return api.sendMessage(`▸ ◉ قائمة المجالات:\n${list}`, event.threadID, event.messageID);

      } else if (args[0] == "المزيد") {
        const res = await axios.get(`https://10minutemail.net/address.api.php?more=1`);
        const user = res.data.mail_get_user;
        const host = res.data.mail_get_host;
        const time = res.data.mail_get_time;
        const stime = res.data.mail_server_time;
        const kmail = res.data.mail_get_key;
        const ltime = res.data.mail_left_time;
        const mid = res.data.mail_list[0]?.mail_id || "لا يوجد";
        const sub = res.data.mail_list[0]?.subject || "لا يوجد";
        const date = res.data.mail_list[0]?.datetime2 || "لا يوجد";

        return api.sendMessage(
`▸ ◉ المزيد من البريد:
│ الإسم: ${user}
│ المضيف: ${host}
│ البريد: ${user}@${host} (.)com
│ الوقت: ${time}
│ وقت الخدمة: ${stime}
│ المفتاح: ${kmail}
│ وقت التذكير: ${ltime}s
│ آيدي البريد: ${mid}
│ المحتوى: ${sub}
│ التاريخ: ${date}`, event.threadID, event.messageID);

      } else if (args[0] == "أحصل") {
        const get = await axios.get(`https://10minutemail.net/address.api.php`);
        const data = get.data;
        const mail = data.mail_get_mail.replace(/\./g, ' . ');
        const id = data.session_id;
        const urlMail = data.permalink.url.replace(/\./g, ' . ');
        const key_mail = data.permalink.key;

        return api.sendMessage(
`▸ ◉ البريد الحالي:
│ البريد: ${mail}
│ آيدي البريد: ${id}
│ رابط البريد: ${urlMail}
│ مفتاح البريد: ${key_mail}`, event.threadID, event.messageID);

      } else if (args[0] == "تفقد") {
        const get = await axios.get(`https://10minutemail.net/address.api.php`);
        const data = get.data.mail_list[0];
        const email = get.data.mail_get_mail.replace(/\./g, ' . ');
        const from = data?.from?.replace(/\./g, ' . ') || "لا يوجد";
        const subject = data?.subject || "لا يوجد";
        const time = data?.datetime2 || "لا يوجد";
        const id = data?.mail_id || "لا يوجد";

        return api.sendMessage(
`▸ ◉ تفقد البريد:
│ البريد: ${email}
│ آيدي البريد: ${id}
│ من: ${from}
│ العنوان: ${subject}
│ الوقت: ${time}`, event.threadID, event.messageID);

      } else {
        return api.sendMessage(
`▸ ◉ أوامر البريد المؤقت:
│ جديد - لإنشاء بريد جديد
│ تفقد - لتفقد صندوق الوارد
│ أحصل - عرض البريد الحالي
│ قائمة - عرض قائمة المجالات المتاحة
▸ يمكنك النقر على رابط البريد وإدخال مفتاح البريد لعرض محتوى الرسائل`, event.threadID, event.messageID);
      }

    } catch (err) {
      return api.sendMessage(`❌ حدث خطأ: ${err.message}`, event.threadID, event.messageID);
    }
  }
};