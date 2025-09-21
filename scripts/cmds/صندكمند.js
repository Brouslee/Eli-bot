const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "صندكمند",
    aliases: ["sendcmd", "getcode"],
    version: "2.2",
    author: "xnil6x - محسّن",
    countDown: 3,
    role: 2,
    shortDescription: "▸ ◉ ارسال كوماند بوت محسّن",
    longDescription: "▸ ◉ يرسل كود الكوماند بالبحث بالاسم أو المستعار أو اسم الملف",
    category: "المطور",
    guide: {
      ar:
        "{pn} <اسم الكوماند أو المستعار أو اسم الملف>\n" +
        "أمثلة:\n" +
        "• {pn} آريا\n" +
        "• {pn} aria\n" +
        "• {pn} trans.js\n" +
        "• {pn} list (لعرض جميع الكوماندات)"
    }
  },

  onStart: async function ({ message, args, event }) {
    const permission = ["100087632392287","100090138577417"];

    if (!permission.includes(event.senderID)) {
      return message.reply("▸ ◉ ⛔ | أنت لا تملك الصلاحيات لاستعمال هذا الأمر");
    }

    const query = args.join(" ").trim();
    const commandsDir = path.join(__dirname, "..", "cmds");

    if (!query) {
      return message.reply(
`▸ ◉ ❌ | يرجى إدخال اسم الكوماند أو المستعار أو اسم الملف
│ 💡 | استخدم 'list' لعرض جميع الكوماندات المتاحة`
      );
    }

    if (query.toLowerCase() === "list") {
      return await listAllCommands(commandsDir, message);
    }

    try {
      const foundFile = await findCommandFile(commandsDir, query);

      if (!foundFile) {
        return message.reply(
`▸ ◉ ❌ | لم يتم العثور على كوماند بالاسم: "${query}"
│ 💡 | جرب استخدام 'list' لعرض جميع الكوماندات`
        );
      }

      const fileContent = fs.readFileSync(foundFile.path, "utf8");
      const fileInfo =
`▸ ◉ 📁 | معلومات الملف
│ 📄 | اسم الملف: ${foundFile.fileName}
│ 🏷️ | اسم الكوماند: ${foundFile.commandName}
│ 📝 | المستعارات: ${foundFile.aliases.join(", ") || "لا يوجد"}
│ 👤 | المطور: ${foundFile.author || "غير محدد"}
│ 📊 | الحجم: ${Math.round((fileContent.length / 1024) * 100) / 100} KB
──────────────────────────────\n`;

      if (fileContent.length > 15000) {
        await message.reply(fileInfo + "▸ ⚠️ | الملف كبير جداً، سيتم إرساله على عدة رسائل...");

        const chunks = splitMessage(fileContent, 15000);
        for (let i = 0; i < chunks.length; i++) {
          await message.reply(
`▸ ◉ 📄 | الجزء ${i + 1}/${chunks.length}:
\`\`\`javascript
${chunks[i]}
\`\`\``
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } else {
        await message.reply(fileInfo + `\`\`\`javascript\n${fileContent}\n\`\`\``);
      }
    } catch (error) {
      console.error("خطأ في قراءة الملف:", error);
      return message.reply(`▸ ◉ ❌ | حدث خطأ في قراءة الملف: ${error.message}`);
    }
  }
};

async function findCommandFile(commandsDir, query) {
  try {
    const files = fs.readdirSync(commandsDir).filter((file) => file.endsWith(".js"));

    const directMatch = files.find(file =>
      file === query || file === query + ".js" || file.toLowerCase() === query.toLowerCase() || file.toLowerCase() === query.toLowerCase() + ".js"
    );

    if (directMatch) {
      const filePath = path.join(commandsDir, directMatch);
      const commandInfo = await getCommandInfo(filePath);
      return { path: filePath, fileName: directMatch, ...commandInfo };
    }

    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      const commandInfo = await getCommandInfo(filePath);

      if (
        commandInfo.commandName === query ||
        commandInfo.aliases.includes(query) ||
        commandInfo.commandName.toLowerCase() === query.toLowerCase() ||
        commandInfo.aliases.some(alias => alias.toLowerCase() === query.toLowerCase())
      ) {
        return { path: filePath, fileName: file, ...commandInfo };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function getCommandInfo(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const configMatch = fileContent.match(/config\s*:\s*{([\s\S]*?)}/);
    let commandName = path.basename(filePath, ".js");
    let aliases = [];
    let author = "";

    if (configMatch) {
      if (/name\s*:\s*["'`](.+?)["'`]/.test(configMatch[1])) commandName = RegExp.$1;
      if (/aliases\s*:\s*\[([^\]]*)\]/.test(configMatch[1])) aliases = RegExp.$1.split(",").map(a => a.replace(/["'`\s]/g, ""));
      if (/author\s*:\s*["'`](.+?)["'`]/.test(configMatch[1])) author = RegExp.$1;
    }

    return { commandName, aliases, author };
  } catch {
    return { commandName: path.basename(filePath, ".js"), aliases: [], author: "" };
  }
}

function splitMessage(text, maxLength) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) chunks.push(text.substring(i, i + maxLength));
  return chunks;
}

async function listAllCommands(commandsDir, message) {
  const files = fs.readdirSync(commandsDir).filter((file) => file.endsWith(".js"));
  const names = files.map((f) => f.replace(".js", ""));
  return message.reply("▸ ◉ 📜 | جميع الكوماندات:\n" + names.join(", "));
}