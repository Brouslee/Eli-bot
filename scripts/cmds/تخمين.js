const { randomString, getTime, convertTime } = global.utils;
const { createCanvas } = require('canvas');

const rows = [
  { col: 4, row: 10, rewardPoint: 1 },
  { col: 5, row: 12, rewardPoint: 2 },
  { col: 6, row: 15, rewardPoint: 3 }
];

module.exports = {
  config: {
    name: "خمن",
    aliases: ["ارقام", "guessnum"],
    version: "1.2",
    author: "sifo anter + تطوير",
    countDown: 5,
    role: 0,
    description: { ar: "لعبة إحزر الرقم" },
    category: "لعبة فردية",
    guide: {
      ar: "  {pn} [4 | 5 | 6] [أحادي | متعدد]: إنشاء لعبة جديدة، مع:\n"
        + "    4 5 6 هو عدد الأرقام للرقم الذي سيتم تخمينه، الافتراضي هو 4.\n"
        + "    أحادي | متعدد هو وضع اللعبة، أحادي هو لاعب واحد، متعدد هو متعدد اللاعبين، الافتراضي هو أحادي.\n"
        + "   مثال:\n"
        + "    {pn}\n"
        + "    {pn} 4 أحادي\n"
        + "   كيفية اللعب: يرد اللاعب على رسالة البوت بالأرقام التي يخمنها.\n"
        + "   لديك " + rows.map(item => `${item.row} مرات (${item.col} أرقام)`).join(", ") + ".\n"
        + "   بعد كل تخمين، ستحصل على تلميحات إضافية لعدد الأرقام الصحيحة وعدد الأرقام في المكان الصحيح.\n"
        + "   ملاحظة: الرقم مكون من أرقام من 0 إلى 9، كل رقم يظهر مرة واحدة فقط ويمكن أن يبدأ الرقم بـ 0.\n"
        + "   {pn} ترتيب <صفحة>: عرض الترتيب.\n"
        + "   {pn} معلومات [<معرف المستخدم> | <@علامة> | <رد>]: عرض معلومات الترتيب.\n"
        + "   {pn} إعادة تعيين: إعادة الترتيب (للمشرف فقط)."
    }
  },

  langs: {
    ar: {
      created: "▸ ◉ جاري إنشاء اللعبة...\n│ يرجى الانتظار قليلًا\n\n▸ ◉ تم إنشاء اللعبة بنجاح",
      gameGuide: "│ عدد المحاولات: %1\n│ عدد الأرقام: %2\n│ الوضع: %3\n│ يمكنك البدء بالتخمين الآن",
      win: "▸ ◉ نتيجة التخمين\n│ اللاعب: %1\n│ الأرقام الصحيحة: %2\n│ الأرقام في المكان الصحيح: %3\n│ تهانينا لقد خمنت الرقم الصحيح وحصلت على %4 نقاط إضافية",
      loss: "▸ ◉ نتيجة التخمين\n│ اللاعب: %1\n│ الأرقام الصحيحة: %2\n│ الأرقام في المكان الصحيح: %3\n│ للأسف لقد خسرت، الرقم الصحيح هو %4",
      charts: "▸ ◉ الترتيب الحالي:\n%1",
      pageInfo: "│ صفحة %1/%2",
      noScore: "⭕ | لا يوجد أحد حقق نتيجة.",
      noPermissionReset: "⚠️ | ليس لديك إذن لإعادة تعيين الترتيب.",
      notFoundUser: "⚠️ | لم يتم العثور على المستخدم برقم التعريف %1 في الترتيب.",
      userRankInfo: "▸ ◉ معلومات الترتيب:\n│ الاسم: %1\n│ النقاط: %2\n│ عدد الألعاب: %3\n│ عدد الانتصارات: %4\n│ %5\n│ عدد الخسائر: %6\n│ نسبة الفوز: %7%\n│ إجمالي وقت اللعب: %8",
      digits: "%1 أرقام: %2",
      resetRankSuccess: "✅ | تمت إعادة تعيين الترتيب بنجاح.",
      invalidCol: "⚠️ | يرجى إدخال عدد الأرقام للتخمين وهو 4 أو 5 أو 6",
      invalidMode: "⚠️ | يرجى إدخال وضع اللعبة أحادي أو متعدد"
    }
  },

  onStart: async function({ message, event, getLang, commandName, args, globalData, usersData, role }) {
    if (args[0] == "rank" || args[0] == "رانك") {
      const rankGuessNumber = await globalData.get("rankGuessNumber", "data", []);
      if (!rankGuessNumber.length) return message.reply(getLang("noScore"));
      const page = parseInt(args[1]) || 1;
      const maxUserOnePage = 30;
      let rankHandle = await Promise.all(rankGuessNumber.slice((page - 1) * maxUserOnePage, page * maxUserOnePage).map(async item => {
        const userName = await usersData.getName(item.id);
        return { ...item, userName, winNumber: item.wins?.length || 0, lossNumber: item.losses?.length || 0 };
      }));
      rankHandle = rankHandle.sort((a, b) => b.winNumber - a.winNumber);
      const medals = ["🥇", "🥈", "🥉"];
      const rankText = rankHandle.map((item, index) => `${medals[index] || index+1} ${item.userName} - ${item.winNumber} wins - ${item.lossNumber} losses`).join("\n");
      return message.reply(getLang("charts", rankText || getLang("noScore")) + "\n" + getLang("pageInfo", page, Math.ceil(rankGuessNumber.length / maxUserOnePage)));
    }

    // لعبة جديدة
    const col = parseInt(args.join(" ").match(/(\d+)/)?.[1] || 4);
    const level = rows.find(item => item.col == col);
    if (!level) return message.reply(getLang("invalidCol"));
    const mode = args.join(" ").match(/(جماعي|أحادي|single|multi|-s|-m)/)?.[1] || "single";
    const row = level.row || 10;
    const rewardPoint = level.rewardPoint;

    const gameData = {
      col,
      row,
      timeStart: parseInt(getTime("x")),
      numbers: [],
      tryNumber: 0,
      answer: randomString(col, true, "0123456789"),
      mode,
      rewardPoint
    };

    const messageData = await message.reply(getLang("created") + "\n\n" + getLang("gameGuide", row, col, mode));
    gameData.messageData = messageData;
    global.GoatBot.onReply.set(messageData.messageID, { commandName, messageID: messageData.messageID, author: event.senderID, gameData });
  },

  onReply: async function({ message, Reply, event, getLang, usersData, globalData }) {
    const { gameData: oldGameData } = Reply;
    if (event.senderID != Reply.author && oldGameData.mode == "single") return;

    const numbers = (event.body || "").split("").map(item => item.trim()).filter(item => item != "" && !isNaN(item));
    if (numbers.length != oldGameData.col) return message.reply(getLang("invalidNumbers", oldGameData.col));

    global.GoatBot.onReply.delete(Reply.messageID);

    const answer = oldGameData.answer;
    let numberRight = 0, numberRightPosition = 0;
    answer.split('').forEach((item, index) => {
      if (numbers.includes(item)) numberRight++;
      if (item == numbers[index]) numberRightPosition++;
    });

    const isWin = numberRight == answer.length && numberRightPosition == answer.length;
    const userName = await usersData.getName(event.senderID);

    message.reply(isWin ? getLang("win", userName, numberRight, numberRightPosition, oldGameData.rewardPoint) :
                        getLang("loss", userName, numberRight, numberRightPosition, answer));

    // تحديث الترتيب
    const rank = await globalData.get("rankGuessNumber", "data", []);
    const data = { tryNumber: oldGameData.tryNumber + 1, timeSuccess: parseInt(getTime("x") - oldGameData.timeStart), date: getTime(), col: oldGameData.col };

    const idx = rank.findIndex(u => u.id == event.senderID);
    if (isWin) {
      if (idx == -1) rank.push({ id: event.senderID, wins: [data], losses: [], points: oldGameData.rewardPoint });
      else { rank[idx].wins.push(data); rank[idx].points += oldGameData.rewardPoint; }
    } else {
      if (idx == -1) rank.push({ id: event.senderID, wins: [], losses: [data], points: 0 });
      else rank[idx].losses.push(data);
    }
    await globalData.set("rankGuessNumber", rank, "data");
  }
};