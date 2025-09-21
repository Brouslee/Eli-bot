const words = [
  "مكتب", "قلم", "ورقة", "كتاب", "شاشة", "سماعة", "هاتف", "حاسوب",
  "نافذة", "باب", "كرسي", "طاولة", "سرير", "وسادة", "بطانية", "سجادة",
  "مطبخ", "ثلاجة", "فرن", "غسالة", "ملعقة", "صحن", "كوب", "سكين",
  "حمام", "مرحاض", "دش", "منشفة", "صابون", "شامبو", "فرشاة", "معجون",
  "حديقة", "زهرة", "شجرة", "عشب", "وردة", "ياسمين", "نخلة", "تفاحة",
  "برتقال", "موز", "فراولة", "عنب", "بطيخ", "شمام", "خيار", "طماطم",
  "بصل", "ثوم", "جزر", "فلفل", "ملح", "سكر", "زيت", "دقيق",
  "لحم", "دجاج", "سمك", "أرز", "خبز", "جبن", "لبن", "بيض",
  "قهوة", "شاي", "عصير", "ماء", "حليب", "عسل", "تمر", "زبيب",
  "سيارة", "دراجة", "طائرة", "قطار", "باص", "سفينة", "شاحنة", "مروحية",
  "ملعب", "كرة", "مرمى", "حكم", "جمهور", "هدف", "فريق", "مدرب",
  "مدرسة", "طالب", "معلم", "صف", "سبورة", "طباشير", "محفظة", "دفتر",
  "مستشفى", "دكتور", "ممرض", "مريض", "دواء", "حقنة", "عمليات", "عيادة",
  "فن", "رسم", "موسيقى", "غناء", "رقص", "تمثيل", "مسرح", "سينما",
  "سوق", "محل", "زبون", "بائع", "سعر", "خصم", "فاتورة", "كاش",
  "حديد", "خشب", "زجاج", "بلاستيك", "ذهب", "فضة", "الماس", "لؤلؤ",
  "نار", "هواء", "تراب", "ماء", "ضوء", "ظل", "صوت", "صورة"
];

module.exports = {
  config: {
    name: "حبار",
    version: "3.6",
    author: "Darkxx",
    countDown: 5,
    role: 0,
    shortDescription: "لعبة ترديد الكلمات - تحدى سرعة البديهة",
    longDescription: "اللعبة تعرض كلمة واللاعب يردد نفس الكلمة خلال 30 ثانية بنظام الأدوار",
    category: "لعبة جماعية"
  },

  onStart: async function ({ message, event, args }) {
    const threadID = event.threadID;
    const targetPlayers = parseInt(args[0]) || 4;

    if (args[0]?.toLowerCase() === "إنهاء") {
      if (global.GoatBot?.squidGame?.[threadID]) {
        clearTimeout(global.GoatBot.squidGame[threadID].timeout);
        delete global.GoatBot.squidGame[threadID];
        return message.reply("✅ تم إنهاء لعبة الحبار.");
      } else {
        return message.reply("⚠️ لا توجد لعبة حالياً.");
      }
    }

    if (targetPlayers < 2 || targetPlayers > 8)
      return message.reply("⚠️ الحد الأدنى 2 والحد الأقصى 8 لاعبين.");

    global.GoatBot ??= {};
    global.GoatBot.squidGame ??= {};
    
    if (global.GoatBot.squidGame[threadID])
      return message.reply("⚠️ هناك لعبة جارية بالفعل.");

    global.GoatBot.squidGame[threadID] = {
      players: [],
      data: {},
      turnIndex: 0,
      targetWord: null,
      started: false,
      target: targetPlayers,
      usedWords: new Set(),
      score: {},
      timeout: null
    };

    await message.reply(`🦑 لعبة الحبار - ترديد الكلمات!\n✋ أرسل "مشارك" للانضمام.\n📨 تبدأ عند وصول ${targetPlayers} لاعبين.\n⏱️ الوقت: 30 ثانية لكل دور`);
  },

  onChat: async function ({ message, event, api, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = event.body?.trim();
    const game = global.GoatBot?.squidGame?.[threadID];
    if (!game) return;

    // دالة بدء الدور الداخلية
    const startTurn = async () => {
      if (!game || game.players.length === 0) return;

      // اختيار كلمة عشوائية غير مستخدمة
      let availableWords = words.filter(word => !game.usedWords.has(word));
      
      if (availableWords.length === 0) {
        game.usedWords.clear();
        availableWords = words;
      }

      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const word = availableWords[randomIndex];
      game.usedWords.add(word);
      game.targetWord = word;

      // اختيار اللاعب حسب الدور
      const playerID = game.players[game.turnIndex];
      const playerName = game.data[playerID]?.name || "لاعب";

      // تهيئة النقاط إذا لم تكن موجودة
      if (!game.score[playerID]) game.score[playerID] = 0;

      await message.reply(`🎯 دور ${playerName}:\n📣 كرر هذه الكلمة:\n\n"${word}"\n\n⏱️ لديك 30 ثانية للرد بنفس الكلمة!`);

      game.timeout = setTimeout(async () => {
        if (!global.GoatBot.squidGame[threadID]) return;
        
        await message.reply(`⏰ انتهى الوقت! تم إقصاء ${playerName}.`);
        
        // إزالة اللاعب من اللعبة
        game.players.splice(game.turnIndex, 1);
        
        // إذا كان اللاعب المقصى هو الأخير، ننهي اللعبة
        if (game.players.length === 0) {
          delete global.GoatBot.squidGame[threadID];
          return message.reply("❌ انتهت اللعبة بدون فائز!");
        }
        
        // ضبط مؤشر الدور ليكون ضمن النطاق الصحيح
        if (game.turnIndex >= game.players.length) {
          game.turnIndex = 0;
        }
        
        setTimeout(startTurn, 2000);
      }, 30000); // 30 ثانية
    };

    // انضمام لاعبين
    if (!game.started && body?.toLowerCase() === "مشارك") {
      if (game.players.includes(senderID))
        return message.reply("✅ أنت مشارك بالفعل.");

      const number = Math.floor(Math.random() * 1000) + 1;
      const name = (await usersData.get(senderID))?.name || "لاعب";

      game.players.push(senderID);
      game.data[senderID] = { number, name };
      game.score[senderID] = 0;

      await message.reply(`🎫 تم تسجيلك يا ${name}، رقمك هو ${number}`);

      if (game.players.length >= game.target) {
        game.started = true;
        await message.reply("🚨 تم اكتمال اللاعبين! تبدأ اللعبة الآن...");
        setTimeout(startTurn, 2000);
      }
      return;
    }

    // التحقق من الإجابة
    if (game.started && game.targetWord) {
      if (!game.players.includes(senderID)) return;
      
      const currentPlayerID = game.players[game.turnIndex];
      if (senderID !== currentPlayerID) return;

      clearTimeout(game.timeout);

      if (body === game.targetWord) {
        game.score[senderID] = (game.score[senderID] || 0) + 1;
        await message.reply(`✅ صحيح! +1 نقطة\n🎯 نقاطك: ${game.score[senderID]}`);

        // الانتقال للاعب التالي
        game.turnIndex = (game.turnIndex + 1) % game.players.length;

        if (game.players.length === 1) {
          const { number, name } = game.data[senderID];
          const totalScore = game.score[senderID];
          const reward = totalScore * 500;
          
          await message.reply(`🏆 الفائز هو ${name} (رقمه ${number})!\n🎯 النقاط: ${totalScore}\n💰 تم منحه ${reward} دينار!`);

          const userData = await usersData.get(senderID);
          userData.money = (userData.money || 0) + reward;
          await usersData.set(senderID, userData);

          delete global.GoatBot.squidGame[threadID];
          return;
        }
        
        setTimeout(startTurn, 2000);
      } else {
        await message.reply("❌ كلمة خاطئة! تم إقصاؤك.");
        
        // إزالة اللاعب من اللعبة
        game.players.splice(game.turnIndex, 1);
        delete game.data[senderID];
        delete game.score[senderID];
        
        // إذا كان اللاعب المقصى هو الأخير، ننهي اللعبة
        if (game.players.length === 0) {
          delete global.GoatBot.squidGame[threadID];
          return message.reply("❌ انتهت اللعبة بدون فائز!");
        }
        
        // ضبط مؤشر الدور ليكون ضمن النطاق الصحيح
        if (game.turnIndex >= game.players.length) {
          game.turnIndex = 0;
        }
        
        setTimeout(startTurn, 2000);
      }
    }
  }
};