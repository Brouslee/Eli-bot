const os = require("os");

module.exports = {
  config: {
    name: "الحالة",
    aliases: ["up"],
    version: "1.1",
    author: "الفريدو",
    role: 0,
    countdown: 5,
    category: "معلومات",
    shortDescription: { ar: "عرض مدة تشغيل البوت" },
    longDescription: { ar: "إظهار مدة تشغيل البوت مع تفاصيل النظام" },
    guide: { ar: "{prefix}مدة2" }
  },

  onStart: async function ({ message, usersData, threadsData }) {
    const uptime = os.uptime();

    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `${days} يوم / ${hours} ساعة / ${mins} دقيقة / ${seconds} ثانية`;

    const totalUsers = (await usersData.getAll()).length;
    const totalThreads = (await threadsData.getAll()).length;

    const النص =  
`▸ ◉ مدة تشغيل البوت
│ ${uptimeString}

▸ ◉ النظام
│ ${os.type()} ${os.release()}

▸ ◉ المعمارية
│ ${os.arch()}

▸ ◉ المعالج
│ ${os.cpus()[0].model} (${os.cpus().length} نواة)

▸ ◉ الرام
│ المجموع: ${Math.round(os.totalmem() / (1024*1024*1024))} GB
│ الفاضي: ${Math.round(os.freemem() / (1024*1024*1024))} GB
│ المستهلك: ${Math.round(process.memoryUsage().rss / (1024*1024))} MB

▸ ◉ معلومات إضافية
│ عدد المستخدمين: ${totalUsers}
│ عدد المجموعات: ${totalThreads}
│ مدة البروسيس: ${Math.floor(process.uptime())} ثانية
`;

    message.reply(النص);  
  }
};