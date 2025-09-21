const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const cacheDirectory = path.join(__dirname, 'cache');

let lastActivityTime = Date.now();
let activeGames = {};

module.exports = {
  config: {
    name: "ثعبان_و_سلم",
    aliases: ["snakeladder"],
    version: "2.0",
    author: "Kshitiz + تطوير",
    role: 0,
    shortDescription: "العب لعبة رمي لوحة النرد",
    longDescription: "Dice Dash هي لعبة مستوحاة من ثعبان و سلم. تنافس مع صديق للوصول إلى المربع رقم 100. احذر من الثعابين واستفد من السلالم!",
    category: "العاب",
    guide: {
      ar: "{p}ثعبان_و_سلم @منشن"
    }
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length !== 1) {
      return message.reply(" ⚠️ | لازم تمنشن صديقك عشان تلعبوا مع بعض");
    }

    const mentionedUserID = mention[0];
    const threadID = event.threadID;

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');

    drawInitialBoard(ctx);

    const imageBuffer = canvas.toBuffer();
    const imagePath = path.join(cacheDirectory, 'game_board.png');
    await fs.promises.mkdir(cacheDirectory, { recursive: true });
    await fs.promises.writeFile(imagePath, imageBuffer);

    const imageStream = fs.createReadStream(imagePath);
    api.sendMessage({ attachment: imageStream }, threadID);

    const players = [event.senderID, mentionedUserID];
    const firstPlayer = players[Math.floor(Math.random() * 2)];
    const secondPlayer = players.find(player => player !== firstPlayer);

    const firstPlayerName = await usersData.getName(firstPlayer);
    const secondPlayerName = await usersData.getName(secondPlayer);

    const mentionMessage = `🎲 | ${firstPlayerName} الأحمر\n🎲 | ${secondPlayerName} الأزرق\n👉 دور ${firstPlayerName} اكتب \`دحرجة\``;
    await message.reply(mentionMessage);

    const gameState = {
      players,
      currentPlayer: firstPlayer,
      firstPlayer,
      secondPlayer,
      firstPlayerPosition: 1,
      secondPlayerPosition: 1,
      messageId: message.messageID,
      threadID
    };

    activeGames[threadID] = gameState;
    lastActivityTime = Date.now();
  },

  onChat: async function ({ event, message, usersData, api, args }) {
    const threadID = event.threadID;
    const gameState = activeGames[threadID];

    if (!gameState) return;
    if (event.senderID !== gameState.currentPlayer) return;
    if (event.body.trim().toLowerCase() !== 'دحرجة') return;

    const { firstPlayer, secondPlayer } = gameState;

    const dice1 = rollDice();
    const dice2 = rollDice();
    const total = dice1 + dice2;

    const currentPos = gameState.currentPlayer === firstPlayer ? gameState.firstPlayerPosition : gameState.secondPlayerPosition;
    let newPos = currentPos + total;

    newPos = checkSnakeOrLadder(newPos);

    if (gameState.currentPlayer === firstPlayer) {
      gameState.firstPlayerPosition = newPos;
    } else {
      gameState.secondPlayerPosition = newPos;
    }

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');
    drawUpdatedBoard(ctx, gameState);

    const imageBuffer = canvas.toBuffer();
    const imagePath = path.join(cacheDirectory, 'game_board.png');
    await fs.promises.writeFile(imagePath, imageBuffer);

    const imageStream = fs.createReadStream(imagePath);
    api.sendMessage({ attachment: imageStream }, threadID);

    if (gameState.firstPlayerPosition >= 100 || gameState.secondPlayerPosition >= 100) {
      const winner = await usersData.getName(
        gameState.firstPlayerPosition >= 100 ? firstPlayer : secondPlayer
      );
      await api.sendMessage(`🏆 | الفائز هو ${winner} 🎉`, threadID);
      delete activeGames[threadID];
      return;
    }

    const nextPlayer = gameState.currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
    const nextPlayerName = await usersData.getName(nextPlayer);
    await message.reply(`👉 دور ${nextPlayerName} اكتب \`دحرجة\``);

    gameState.currentPlayer = nextPlayer;
    lastActivityTime = Date.now();
  }
};

// 🎨 الرسومات
function drawInitialBoard(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 600, 600);
  gradient.addColorStop(0, "#f0f8ff");
  gradient.addColorStop(1, "#e6f7ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 600);

  for (let i = 9; i >= 0; i--) {
    for (let j = 0; j < 10; j++) {
      const x = j * 60;
      const y = i * 60;
      ctx.fillStyle = (i + j) % 2 === 0 ? "#fafafa" : "#d9f0ff";
      ctx.fillRect(x, y, 60, 60);
      ctx.strokeStyle = "#999";
      ctx.strokeRect(x, y, 60, 60);
    }
  }

  ctx.font = "14px Arial bold";
  ctx.fillStyle = "#333";
  let number = 1;
  for (let i = 9; i >= 0; i--) {
    for (let j = 0; j < 10; j++) {
      const x = j * 60 + 5;
      const y = i * 60 + 20;
      ctx.fillText(number.toString(), x, y);
      number++;
    }
  }

  // ثعابين وسلالم
  drawSnake(ctx, 47, 28);
  drawLadder(ctx, 25, 46);
  drawLadder(ctx, 38, 62);
  drawSnake(ctx, 67, 54);
  drawSnake(ctx, 73, 16);
  drawSnake(ctx, 82, 51);
  drawLadder(ctx, 36, 93);
  drawLadder(ctx, 49, 88);
  drawSnake(ctx, 64, 60);
  drawSnake(ctx, 98, 85);
}

function drawUpdatedBoard(ctx, gameState) {
  drawInitialBoard(ctx);
  drawCircle(ctx, gameState.firstPlayerPosition, 'red', -10);
  drawCircle(ctx, gameState.secondPlayerPosition, 'blue', 10);
}

function drawCircle(ctx, position, color, offset = 0) {
  position = position - 1;
  const row = Math.floor(position / 10);
  const col = position % 10;
  const x = col * 60 + 30 + offset;
  const y = (9 - row) * 60 + 30;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawSnake(ctx, start, end) {
  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 6;
  ctx.setLineDash([10, 6]);
  drawLine(ctx, start, end);
  ctx.setLineDash([]);
}

function drawLadder(ctx, start, end) {
  const [sx, sy] = getCoords(start);
  const [ex, ey] = getCoords(end);

  ctx.strokeStyle = "#8b4513";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(sx - 10, sy);
  ctx.lineTo(ex - 10, ey);
  ctx.moveTo(sx + 10, sy);
  ctx.lineTo(ex + 10, ey);
  ctx.stroke();

  ctx.strokeStyle = "#228B22";
  ctx.lineWidth = 2;
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x1 = sx - 10 + (ex - sx) * t;
    const y1 = sy + (ey - sy) * t;
    const x2 = sx + 10 + (ex - sx) * t;
    const y2 = sy + (ey - sy) * t;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function getCoords(pos) {
  pos = pos - 1;
  const row = Math.floor(pos / 10);
  const col = pos % 10;
  const x = col * 60 + 30;
  const y = (9 - row) * 60 + 30;
  return [x, y];
}

function drawLine(ctx, start, end) {
  const [sx, sy] = getCoords(start);
  const [ex, ey] = getCoords(end);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
}

// 🎲 وظائف
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function checkSnakeOrLadder(position) {
  switch (position) {
    case 15: return 3;
    case 47: return 28;
    case 25: return 46;
    case 38: return 62;
    case 67: return 54;
    case 73: return 16;
    case 82: return 51;
    case 36: return 93;
    case 49: return 88;
    case 64: return 60;
    case 98: return 85;
    default: return position;
  }
}