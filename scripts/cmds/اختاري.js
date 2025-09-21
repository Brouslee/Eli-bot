module.exports = {  
  config: {  
    name: "اختاري",  
    aliases: ["choose", "اختر", "random"],  
    version: "1.2.0",  
    author: "Mikey + تعديل SIFOANTER",  
    role: 0,  
    category: "fun",  
    shortDescription: "اختيار عشوائي بين خيارات",  
    longDescription: "يختار لك خيار عشوائي من بين مجموعة خيارات تفصلهم بـ |",  
    guide: {  
      ar: "اكتب: اختاري خيار1 | خيار2 | خيار3"  
    }  
  },  
  langs: {  
    ar: {  
      guide: "▸ ◉ طريقة الاستعمال:\n│ اختاري خيار1 | خيار2 | خيار3",  
      needOptions: "▸ ◉ لازم تكتب الخيارات\n│ مفصولين بـ |",  
      notEnough: "▸ ◉ محتاج على الأقل خيارين\n│ باش نقدر نختار",  
      tooMany: "▸ ◉ الحد الأقصى 30 خيار\n│ نقّص شوية",  
      result: "▸ ◉ اخترت: {choice} ⚙"  
    }  
  },  
  onStart: async function({ message, args, getLang }) {  
    const text = args.join(" ").trim();  
    if (!text) return message.reply(getLang("guide"));  

    const options = text.split("|").map(s => s.trim()).filter(s => s.length > 0);  
    if (options.length === 0) return message.reply(getLang("needOptions"));  
    if (options.length < 2) return message.reply(getLang("notEnough"));  
    if (options.length > 30) return message.reply(getLang("tooMany"));  

    const pick = options[Math.floor(Math.random() * options.length)];  
    const resultText = getLang("result").replace("{choice}", pick);  
    await message.reply(resultText);  
  }  
};