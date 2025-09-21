const fs = require('fs');

module.exports = {
  config: {
    name: "قتال",
    version: "4.1",
    author: "Shikaki + كوميديا",
    role: 0,
    countdown: 10,
    category: "لعبة ثنائية",
    shortDescription: { ar: "قاتل خصمك بحركات ساخرة ورموز ممتعة" },
    longDescription: { ar: "لعبة قتال ثنائية حيث الفوز يكون بالإهانات والذكاء قبل الضرب" },
    guide: { ar: "{prefix}قتال @منشن - ابدأ المعركة" }
  },

  onStart: async function({ message, event, usersData }) {
    const threadID = event.threadID;
    if (global.GoatBot.ongoingFights?.has(threadID)) 
      return message.send("▸ ◉ المعركة قائمة بالفعل\n│ الرجاء الانتظار حتى ينتهي القتال الحالي");

    const mention = Object.keys(event.mentions);
    if (mention.length !== 1) 
      return message.send("▸ ◉ يجب ذكر خصم واحد فقط\n│ مثال: {prefix}قتال @اسم_الشخص");

    const challengerID = event.senderID;
    const opponentID = mention[0];

    const challenger = await usersData.getName(challengerID);
    const opponent = await usersData.getName(opponentID);

    const fight = {
      participants: [
        { id: challengerID, name: challenger, hp: 100 },
        { id: opponentID, name: opponent, hp: 100 }
      ],
      currentPlayer: Math.random() < 0.5 ? challengerID : opponentID,
      threadID
    };

    const gameInstance = {
      fight,
      currentTurnMessageID: null,
      timeoutID: null
    };

    if (!global.GoatBot.gameInstances) global.GoatBot.gameInstances = new Map();
    if (!global.GoatBot.ongoingFights) global.GoatBot.ongoingFights = new Map();

    global.GoatBot.gameInstances.set(threadID, gameInstance);
    global.GoatBot.ongoingFights.set(threadID, fight);

    message.send(`▸ ◉ المعركة بدأت بين ${challenger} و ${opponent}\n│ استعدوا للقتال`);
    startTurn(message, fight);
    startTimeout(threadID, message);
  },

  onReply: async function({ event, message }) {
    const threadID = event.threadID;
    const gameInstance = global.GoatBot.gameInstances?.get(threadID);
    if (!gameInstance) return;

    const currentPlayerID = gameInstance.fight.currentPlayer;
    const currentPlayer = gameInstance.fight.participants.find(p => p.id === currentPlayerID);

    if (event.messageReply?.messageID !== gameInstance.currentTurnMessageID) return;
    if (event.senderID !== currentPlayerID) {
      message.reply(`▸ ◉ ليس دورك\n│ دور ${currentPlayer.name} الآن`);
      return;
    }

    const attack = event.body.trim().toLowerCase();
    if (attack === "استسلام") {
      const opponent = gameInstance.fight.participants.find(p => p.id !== currentPlayerID).name;
      message.send(`▸ ◉ ${currentPlayer.name} رمى المنشفة\n│ ${opponent} ربح`);
      endFight(threadID);
      return;
    }

    const attacks = {
      "ركل": "ركلة قوية تهز الأرض تحت أقدام خصمك",
      "لكمة": "لكمة مباشرة تجعل خصمك يفكر مرتين قبل الرد",
      "صفعة": "صفعة سريعة تترك خصمك مذهولاً",
      "رمي حجر": "ترمي حجرًا صغيرًا لكنه يوجع أكثر من المتوقع",
      "صرخة": "صرخة عالية تخيف خصمك وتهزه قليلاً"
    };

    if (!attacks[attack]) {
      message.reply("▸ ◉ حركة غير صحيحة\n│ استخدم: ركـل, لكمة, صفعة, رمي حجر, صرخة, استسلام");
      return;
    }

    const damage = Math.floor(Math.random() * 20 + 10);
    const opponent = gameInstance.fight.participants.find(p => p.id !== currentPlayerID);
    opponent.hp -= damage;

    message.send(
`▸ ◉ ${currentPlayer.name} استخدم ${attack} على ${opponent.name}
│ تأثير الحركة: ${attacks[attack]}
│ الضرر: ${damage}
│ دم ${currentPlayer.name}: ${currentPlayer.hp}
│ دم ${opponent.name}: ${opponent.hp}`
    );

    if (opponent.hp <= 0) {
      message.send(`▸ ◉ انتهت المعركة\n│ ${currentPlayer.name} ربح ضد ${opponent.name}`);
      endFight(threadID);
    } else {
      gameInstance.fight.currentPlayer = opponent.id;
      startTurn(message, gameInstance.fight);
    }
  }
};

function startTurn(message, fight) {
  const currentPlayer = fight.participants.find(p => p.id === fight.currentPlayer);
  const opponent = fight.participants.find(p => p.id !== fight.currentPlayer);
  const attacks = ["ركل", "لكمة", "صفعة", "رمي حجر", "صرخة", "استسلام"];

  message.send(
`▸ ◉ دور ${currentPlayer.name}
│ خصمك: ${opponent.name}
│ الحركات المتاحة: ${attacks.join(", ")}
│ الرجاء الرد على هذه الرسالة بحركتك`,
    (err, info) => {
      global.GoatBot.gameInstances.get(fight.threadID).currentTurnMessageID = info.messageID;
    }
  );
}

function startTimeout(threadID, message) {
  const timeoutID = setTimeout(() => {
    const gameInstance = global.GoatBot.gameInstances.get(threadID);
    if (!gameInstance) return;

    const [p1, p2] = gameInstance.fight.participants;
    const winner = p1.hp > p2.hp ? p1 : p2;
    const loser = p1.hp > p2.hp ? p2 : p1;

    message.send(`▸ ◉ انتهى الوقت\n│ ${winner.name} ربح لأن ${loser.name} لم يرد`);
    endFight(threadID);
  }, 120 * 1000);

  global.GoatBot.gameInstances.get(threadID).timeoutID = timeoutID;
}

function endFight(threadID) {
  global.GoatBot.ongoingFights.delete(threadID);
  const gameInstance = global.GoatBot.gameInstances.get(threadID);
  if (gameInstance?.timeoutID) clearTimeout(gameInstance.timeoutID);
  global.GoatBot.gameInstances.delete(threadID);
}