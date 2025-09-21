const moment = require("moment-timezone");

const author = "الفريدو";
const code = {
    name: "مهمة",
    version: "2.0"
};

const tasks = [
  { title: "البحث عن كنز مخفي", advice: "احرص على متابعة الخريطة بدقة" },
  { title: "إنقاذ القطة من الشجرة", advice: "كن حذرًا عند الصعود" },
  { title: "توصيل رسالة مهمة", advice: "تأكد من عدم فقدان الرسالة" },
  { title: "حل لغز المدينة القديمة", advice: "فكر جيدًا قبل اتخاذ أي خطوة" },
  { title: "جمع الأعشاب الطبية", advice: "احذر النباتات السامة" },
  { title: "مساعدة الجيران في السوق", advice: "كن صبورًا وودودًا" },
  { title: "تدريب الحيوانات في المزرعة", advice: "استخدم الطعام كتشجيع" }
];

module.exports = {
    config: {
        name: code.name,
        version: code.version,
        author: author,
        role: 0,
        shortDescription: { ar: "▸ أداء مهمة يومية والحصول على مكافأة" },
        longDescription: { ar: "▸ اختر مهمة عشوائية اليوم واحصل على مكافأة مالية في اللعبة" },
        category: "مهام"
    },

    onStart: async function({ message, event, usersData }) {
        const userData = await usersData.get(event.senderID);
        const now = moment();
        const lastTask = userData.data.lastTask || null;

        if (lastTask && now.diff(moment(lastTask), "hours") < 24) {
            const remaining = 24 - now.diff(moment(lastTask), "hours");
            return message.reply(`▸ ◉ تنبيه\n│ لازم تنتظر ${remaining} ساعة قبل أداء مهمة جديدة`);
        }

        const taskIndex = Math.floor(Math.random() * tasks.length);
        const selectedTask = tasks[taskIndex];
        const rewardAmount = Math.floor(Math.random() * 201); // مكافأة عشوائية 0-200

        userData.data.lastTask = now.toISOString();

        await usersData.set(event.senderID, {
            money: userData.money + rewardAmount,
            data: userData.data
        });

        const startMsg = 
`▸ ◉ مهمة اليوم
│ مهمتك: ${selectedTask.title}
│ نصيحة: ${selectedTask.advice}
▸ ◉ حصلت على مكافأة
│ المبلغ: ${rewardAmount} فيلور`;

        message.reply(startMsg);
    }
};