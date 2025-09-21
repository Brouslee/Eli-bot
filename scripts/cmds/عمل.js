const moment = require("moment-timezone");

const author = "حسين يعقوبي";
const code = {
    name: "عمل",
    version: "2.1"
};

const jobs = [
  { title: "بيع التذاكر في محطة الحافلات", advice: "تحقق من التذاكر قبل البيع لتجنب المشاكل" },
  { title: "إصلاح سيارة", advice: "ارتدِ القفازات وفحص الأدوات قبل البدء" },
  { title: "البرمجة", advice: "خذ استراحات منتظمة لتجنب الإرهاق" },
  { title: "هاكر فايسبوك", advice: "استخدم مهاراتك للأغراض القانونية فقط" },
  { title: "شيف في مطبخ 5 نجوم", advice: "نظافة المطبخ أهم من أي وصفة" },
  { title: "سائق حافلة", advice: "التزم بقوانين المرور لضمان سلامة الركاب" },
  { title: "سائق أجرة", advice: "اختر المسارات الأسرع لتوفير الوقت" },
  { title: "إصلاح الحنفيات", advice: "تحقق من المياه قبل البدء بالعمل" },
  { title: "ستريمر ألعاب", advice: "تفاعل مع جمهورك لزيادة المشاهدات" },
  { title: "تجارة إلكترونية", advice: "احرص على وصف المنتج بدقة وصدق" },
  { title: "ربت بيت", advice: "نظف ورتب المكان يوميًا للحفاظ على النظام" },
  { title: "بائعة الزهور", advice: "ابتسم للعملاء فتصبح المبيعات أسهل" },
  { title: "العب كرة القدم", advice: "احرص على الإحماء قبل اللعب لتجنب الإصابات" },
  { title: "مدرس خصوصي", advice: "اشرح الدروس بوضوح وركز على الفهم" },
  { title: "مصور فوتوغرافي", advice: "اختر الإضاءة المناسبة لتظهر الصور بشكل أفضل" },
  { title: "كاتب محتوى", advice: "احرص على التدقيق اللغوي قبل النشر" },
  { title: "رسام كوميكس", advice: "ابدأ بالفكرة ثم رسم الشخصيات خطوة خطوة" },
  { title: "مصمم جرافيك", advice: "احرص على تناسق الألوان والخطوط" },
  { title: "مزارع", advice: "اعتنِ بالنباتات وسقها بانتظام" },
  { title: "عامل نظافة", advice: "ارتدِ أدوات الحماية للحفاظ على صحتك" },
  { title: "سائق شاحنة", advice: "تحقق من الشاحنة قبل الرحلة لتجنب الأعطال" },
  { title: "موسيقي", advice: "تمرن يوميًا لتطوير مهارتك" },
  { title: "مترجم", advice: "احرص على الترجمة الدقيقة والمعاني الصحيحة" },
  { title: "خباز", advice: "تأكد من ضبط درجة الحرارة والمقادير بدقة" },
  { title: "مغني", advice: "احرص على التمرين الصوتي قبل الأداء" },
  { title: "صيدلي", advice: "تحقق من الجرعات والتعليمات قبل صرف الدواء" },
  { title: "مطور ألعاب", advice: "اختبر اللعبة جيدًا قبل الإطلاق" },
  { title: "مهندس معماري", advice: "خطط التصميم بعناية واهتم بالتفاصيل" },
  { title: "كاتب رواية", advice: "احرص على بناء الشخصيات والأحداث بوضوح" },
  { title: "مصمم أزياء", advice: "اختر ألوان وأقمشة متناسقة" },
  { title: "سائق توصيل", advice: "حافظ على سرعة مناسبة وكن حذرًا في الطرق" },
  { title: "مغسلة سيارات", advice: "استخدم المواد المناسبة للحفاظ على الطلاء" },
  { title: "فني كمبيوتر", advice: "افحص الأجهزة بدقة قبل البدء بالصيانة" },
  { title: "مدرب لياقة", advice: "ابدأ بجلسة إحماء قبل التدريبات" },
  { title: "حلاق", advice: "احرص على أدوات نظيفة ومعقمة" },
  { title: "مهندس صوت", advice: "اختبر الصوت قبل البث للتأكد من الجودة" },
  { title: "مدير متجر", advice: "نظم المنتجات لتسهيل البيع" },
  { title: "مصور فيديو", advice: "استخدم زوايا مختلفة لإبراز المشهد" },
  { title: "مزارع دواجن", advice: "تأكد من نظافة المكان وسلامة الطيور" },
  { title: "صانع محتوى يوتيوب", advice: "خطط الفيديو قبل التصوير لتوفير الوقت" },
  { title: "مصمم ديكور", advice: "اختر أثاث متناسق وألوان مريحة" },
  { title: "طباخ منزلي", advice: "احرص على المكونات الطازجة لكل وجبة" },
  { title: "كاتب سيناريو", advice: "ابنِ الحبكة الدرامية بعناية" }
];

module.exports = {
    config: {
        name: code.name,
        version: code.version,
        author: author,
        role: 0,
        shortDescription: { ar: "قم بإستقبال هدية يومية" },
        longDescription: { ar: "اختر عمل عشوائي اليوم واحصل على مبلغ عشوائي" },
        category: "إقتصاد"
    },

    onStart: async function({ message, event, usersData }) {
        const userData = await usersData.get(event.senderID);
        const now = moment();
        const lastWorked = userData.data.lastWorked || null;

        if (lastWorked && now.diff(moment(lastWorked), "hours") < 24) {
            const remaining = 24 - now.diff(moment(lastWorked), "hours");
            return message.reply(
`▸ ◉ تنبيه
│ لازم تنتظر ${remaining} ساعة قبل ما تشتغل تاني
▸ تعال بكرة وخذ عمل جديد`);
        }

        const jobIndex = Math.floor(Math.random() * jobs.length);
        const selectedJob = jobs[jobIndex];
        const rewardAmount = Math.floor(Math.random() * 101);

        userData.data.lastJob = selectedJob.title;
        userData.data.lastWorked = now.toISOString();

        await usersData.set(event.senderID, {
            money: userData.money + rewardAmount,
            data: userData.data
        });

        const startMsg = 
`▸ ◉ عمل اليوم
│ عملك: ${selectedJob.title}
│ نصيحة: ${selectedJob.advice}
▸ حصلت على مبلغ: ${rewardAmount} دولار
│ استمر في العمل لتزيد أرباحك`;

        message.reply(startMsg);
    }
};