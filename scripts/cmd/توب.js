const fs = require("fs-extra");
const path = __dirname + "/topData.json";

module.exports = {
  config: {
    name: "الاغنى",
    version: "4.4",
    author: "Loufi & تعديل",
    role: 0,
    shortDescription: { ar: "عرض أغنى 10 مستخدمين" },
    longDescription: { ar: "يعرض قائمة الأغنى مع الفايز السابق والرقم القياسي ويصفر الفلوس أسبوعيًا" },
    category: "المجموعة",
    guide: { ar: "{pn}اغنى" }
  },

  onStart: async function ({ message, usersData }) {
    const allUsers = await usersData.getAll();
    let data = { lastWinner: null, lastScore: 0, recordHolder: null, recordScore: 0, lastReset: 0 };
    if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path));

    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - data.lastReset >= oneWeek) {
      for (let user of allUsers) await usersData.set(user.userID, { money: 0 });
      data.lastReset = now;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }

    const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 10);
    const currentWinner = topUsers[0];
    const currentScore = currentWinner.money;

    if (currentWinner.name !== data.lastWinner || currentScore !== data.lastScore) {
      data.lastWinner = currentWinner.name;
      data.lastScore = currentScore;
    }

    if (currentScore > data.recordScore) {
      data.recordHolder = currentWinner.name;
      data.recordScore = currentScore;
    }

    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    const ranks = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣","🔟"];
    const medals = ["🥇","🥈","🥉"];

    const topUsersList = topUsers.map((user,i)=>{
      let medal = medals[i]||"";
      return `› ${ranks[i]}〘 ${user.name} ${medal} 〙\n   ⌯ الرصيد : ${user.money}$`;
    });

    const line = "─────────────────";

    const messageText = `
✦┇تصنيف الأثرياء 🏆
⟫ أفضل 10 أغنياء لهذا الأسبوع  

${topUsersList.join("\n")}

${line}

⟫ الفائز السابق : ${data.lastWinner} | ${data.lastScore}$
⟫ الرقم القياسي : ${data.recordHolder} | ${data.recordScore}$

${line}

✦┇النقاط تُعاد كل أسبوع 🔁
⟫ عدد المشاركين : ${allUsers.length}
    `;

    message.reply(messageText.trim());
  }
};