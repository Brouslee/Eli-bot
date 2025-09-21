const { getPrefix } = global.utils;    
const { commands } = global.GoatBot;    
    
module.exports = {    
  config: {    
    name: "العاب",    
    aliases: ["games"],    
    version: "2.5",    
    author: "محمد",    
    countDown: 5,    
    role: 0,    
    shortDescription: { ar: "عرض قائمة الألعاب" },    
    longDescription: { ar: "شوف أوامر الألعاب كلها مرتبة حسب النوع" },    
    category: "info",    
    guide: { ar: "{pn}" }    
  },    
    
  langs: {    
    ar: {    
      noGames: "مافي أي ألعاب حالياً",    
      tip: "اكتب \"اوامر <اسم اللعبة>\" علشان تشوف تفاصيلها"    
    }    
  },    
    
  onStart: async function ({ message, event, getLang }) {    
    const { threadID } = event;    
    const prefix = getPrefix(threadID);    
    
    const gameCommands = Array.from(commands.values()).filter(cmd =>    
      cmd.config.category?.startsWith("لعبة")    
    );    
    
    if (gameCommands.length === 0) return message.reply(getLang("noGames"));    
    
    const single = gameCommands.filter(cmd => cmd.config.category === "لعبة فردية");    
    const duo = gameCommands.filter(cmd => cmd.config.category === "لعبة ثنائية");    
    const multi = gameCommands.filter(cmd => cmd.config.category === "لعبة جماعية");    
    
    const formatList = (arr) => {    
      return arr.length    
        ? arr.map((cmd) => {    
            const aliases = cmd.config.aliases?.length    
              ? ` (${cmd.config.aliases.join(", ")})`    
              : "";    
            return `▸ | ${cmd.config.name}${aliases}`;    
          }).join("\n│ ")    
        : "▸ — مافي";    
    };    
    
    let msg = `── قائمة الألعاب ──\n\n`;    
    
    msg += `▸ ◉ ألعاب فردية (${single.length}):\n│ ${formatList(single)}\n\n`;    
    msg += `▸ ◉ ألعاب ثنائية (${duo.length}):\n│ ${formatList(duo)}\n\n`;    
    msg += `▸ ◉ ألعاب جماعية (${multi.length}):\n│ ${formatList(multi)}\n\n`;    
    
    const total = single.length + duo.length + multi.length;    
    msg += `▸ ◉ المجموع الكلي: ${total}\n\n`;    
    msg += `▸ ◉ نصيحة:\n│ ${getLang("tip", prefix + "اوامر")}`;    
    
    return message.reply(msg);    
  }    
};