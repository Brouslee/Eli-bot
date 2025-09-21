const { getExtFromUrl, drive, getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: 'الردود',
    aliases: ['short'],
    version: '1.13',
    author: 'NTKhang',
    countDown: 5,
    role: 0,
    shortDescription: { ar: 'إضافة وإدارة الردود التلقائية داخل المجموعة' },
    longDescription: { ar: 'يمكنك إضافة، حذف، رؤية وإدارة جميع الردود التلقائية في مجموعتك' },
    category: 'خدمات',
    guide: { ar:
`► إضافة رد: {pn} إضافة <الكلمة => <المحتوى>  
  مثال: {pn} إضافة السلام عليكم => وعليكم السلام ورحمة الله وبركاته  

► حذف رد: {pn} حذف <الكلمة>  

► إزالة جميع الردود: {pn} إزالة  

► رؤية قائمة الردود: {pn} قائمة  
  الردود التي تبدأ بكلمة معينة: {pn} قائمة بدأ <كلمة>  
  الردود التي تنتهي بكلمة معينة: {pn} القائمة النهاية <كلمة>  
  الردود التي تحتوي كلمة معينة: {pn} قائمة محتوى <كلمة>` }
  },

  langs: {
    ar: {
      missingContent: '[!] الرجاء إدخال محتوى للرد',
      shortcutExists: '[!] الرد "%1" موجود بالفعل. تفاعل مع الرسالة لتحديثه',
      shortcutExistsByOther: '[!] هذا الرد تم إضافته من قبل عضو آخر جرب شيئًا آخر',
      added: '[✓] تم إضافة الرد %1 => %2 بنجاح',
      addedAttachment: '[!] مع %1 من المرفقات',
      missingKey: '[!] الرجاء إدخال اسم الرد',
      notFound: '[!] لم يتم العثور على رد للكلمة %1',
      onlyAdmin: '[×] فقط آدمن المجموعة يمكنه حذف ردود الآخرين',
      deleted: '[✓] تم حذف الرد %1 بنجاح',
      empty: '[!] لم يتم إضافة أي ردود في مجموعتك',
      message: 'رسالة',
      attachment: 'مرفق',
      list: 'قائمة الردود الخاصة بك',
      listWithTypeStart: '[*] الردود التي تبدأ ب "%1"',
      listWithTypeEnd: '[*] الردود التي تنتهي ب "%1"',
      listWithTypeContain: '[*] الردود التي تحتوي على "%1"',
      listWithTypeStartNot: '[!] لا توجد ردود تبدأ ب "%1"',
      listWithTypeEndNot: '[×] لا توجد ردود تنتهي ب "%1"',
      listWithTypeContainNot: '[!] لا توجد ردود تحتوي على "%1"',
      onlyAdminRemoveAll: '[×] فقط آدمن المجموعة يمكنه إزالة جميع الردود',
      confirmRemoveAll: '[!] هل أنت متأكد من إزالة جميع الردود في هذه المجموعة؟\nتفاعل مع هذه الرسالة للتأكيد',
      removedAll: '[✓] تم إزالة جميع الردود بنجاح'
    }
  },

  onStart: async function ({ args, threadsData, message, event, role, usersData, getLang, commandName }) {
    const { threadID, senderID, body } = event;
    const shortCutData = await threadsData.get(threadID, 'data.shortcut', []);

    switch (args[0]) {
      case 'إضافة': {
        const split = body.split(' ').slice(2).join(' ').split('=>');
        const attachments = [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type));

        let key = split[0];
        let content = split.slice(1).join('=>');
        if (!key || (!content && attachments.length === 0))
          return message.reply(getLang('missingContent'));

        key = key.trim().toLowerCase();
        content = (content || "").trim();

        const alreadyExists = shortCutData.find(item => item.key == key);
        if (alreadyExists) {
          if (alreadyExists.author == senderID)
            return message.reply(getLang('shortcutExists', key), async (err, info) => {
              if (err) return;
              global.GoatBot.onReaction.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: senderID,
                type: 'replaceContent',
                newShortcut: await createShortcut(key, content, attachments, threadID, senderID)
              });
            });
          else
            return message.reply(getLang('shortcutExistsByOther'));
        }

        const newShortcut = await createShortcut(key, content, attachments, threadID, senderID);
        shortCutData.push(newShortcut);
        await threadsData.set(threadID, shortCutData, 'data.shortcut');

        let msg = `${getLang('added', key, content)}\n`;
        if (newShortcut.attachments.length > 0)
          msg += getLang('addedAttachment', newShortcut.attachments.length);
        message.reply(msg);
        break;
      }

      case 'حذف':
      case 'مسح': {
        const key = args.slice(1).join(' ')?.trim()?.toLowerCase();
        if (!key) return message.reply(getLang('missingKey'));
        const index = shortCutData.findIndex(x => x.key === key);
        if (index === -1) return message.reply(getLang('notFound', key));
        if (senderID != shortCutData[index].author && role < 1) return message.reply(getLang('onlyAdmin'));
        shortCutData.splice(index, 1);
        await threadsData.set(threadID, shortCutData, 'data.shortcut');
        message.reply(getLang('deleted', key));
        break;
      }

      case 'قائمة': {
        if (shortCutData.length === 0) return message.reply(getLang('empty'));
        let shortCutList = shortCutData;
        let stringType = getLang('list');

        if (args[1]) {
          const type = args[1];
          const keyword = args.slice(2).join(' ');
          if (type == "start") {
            shortCutList = shortCutData.filter(x => x.key.startsWith(keyword));
            stringType = getLang('listWithTypeStart', keyword);
          } else if (type == "end") {
            shortCutList = shortCutData.filter(x => x.key.endsWith(keyword));
            stringType = getLang('listWithTypeEnd', keyword);
          } else if (["contain", "has", "have", "include", "in"].includes(type)) {
            shortCutList = shortCutData.filter(x => x.key.includes(keyword));
            stringType = getLang('listWithTypeContain', keyword);
          }
          if (shortCutList.length === 0) {
            if (type == "start") return message.reply(getLang('listWithTypeStartNot', keyword));
            else if (type == "end") return message.reply(getLang('listWithTypeEndNot', keyword));
            else return message.reply(getLang('listWithTypeContainNot', keyword));
          }
        }

        const list = (
          await Promise.all(
            shortCutList.map(async (x, index) =>
              `[${index + 1}] ${x.key} => ${x.content ? 1 : 0} ${getLang("message")}, ${x.attachments.length} ${getLang('attachment')} (${await usersData.getName(x.author)})`
            )
          )
        ).join('\n');

        message.reply(stringType + '\n' + list);
        break;
      }

      case 'إزالة':
      case '-rm':
      case 'إعادة_التعيين':
      case 'rm': {
        if (threadID != senderID && role < 1) return message.reply(getLang('onlyAdminRemoveAll'));
        message.reply(getLang('confirmRemoveAll'), (err, info) => {
          if (err) return;
          global.GoatBot.onReaction.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: senderID,
            type: 'removeAll'
          });
        });
        break;
      }

      default:
        message.SyntaxError();
        break;
    }
  },

  onReaction: async function ({ event, message, threadsData, getLang, Reaction }) {
    const { author } = Reaction;
    const { threadID, userID } = event;
    if (author != userID) return;

    if (Reaction.type == 'removeAll') {
      await threadsData.set(threadID, [], "data.shortcut");
      return message.reply(getLang('removedAll'));
    } else if (Reaction.type == 'replaceContent') {
      const shortCutData = await threadsData.get(threadID, 'data.shortcut', []);
      const index = shortCutData.findIndex(x => x.key === Reaction.newShortcut.key);
      if (index == -1) shortCutData.push(Reaction.newShortcut);
      else shortCutData[index] = Reaction.newShortcut;
      await threadsData.set(threadID, shortCutData, 'data.shortcut');
      return message.reply(getLang('added', Reaction.newShortcut.key, Reaction.newShortcut.content) + (Reaction.newShortcut.attachments.length > 0 ? `\n${getLang('addedAttachment', Reaction.newShortcut.attachments.length)}` : ''));
    }
  },

  onChat: async ({ threadsData, message, event, usersData }) => {
    const { threadID } = event;
    const body = (event.body || '').toLowerCase();
    const dataShortcut = await threadsData.get(threadID, 'data.shortcut', []);
    const findShortcut = dataShortcut.find(x => x.key === body);
    let attachments = [];

    if (findShortcut) {
      if (findShortcut.attachments.length > 0) {
        for (const id of findShortcut.attachments)
          attachments.push(drive.getFile(id, 'stream', true));
        attachments = await Promise.all(attachments);
      }
      message.reply({
        body: findShortcut.content,
        attachment: attachments
      });
    }
  }
};

async function createShortcut(key, content, attachments, threadID, senderID) {
  let attachmentIDs = [];
  if (attachments.length > 0)
    attachmentIDs = attachments.map(attachment => new Promise(async (resolve) => {
      const ext = attachment.type == "audio" ? "mp3" : getExtFromUrl(attachment.url);
      const fileName = `${Date.now()}.${ext}`;
      const infoFile = await drive.uploadFile(`shortcut_${threadID}_${senderID}_${fileName}`, attachment.type == "audio" ? "audio/mpeg" : undefined, await getStreamFromURL(attachment.url));
      resolve(infoFile.id);
    }));

  return {
    key: key.trim().toLowerCase(),
    content,
    attachments: await Promise.all(attachmentIDs),
    author: senderID
  };
}