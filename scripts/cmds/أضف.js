const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    config: {
        name: "أضف",
        version: "1.5",
        author: "NTKhang",
        countDown: 5,
        role: 1,
        shortDescription: "▸ ◉ إضافة مستخدمين للمجموعة",
        longDescription: "▸ ◉ إضافة مستخدمين إلى مجموعتك بسهولة، حتى لو تم طردهم سابقاً، يدعم الرابط، الـUID والرد على رسالة",
        category: "المجموعات",
        guide: "{pn} [رابط الملف الشخصي | UID] أو بالرد على رسالة المستخدم"
    },

    langs: {
        ar: {
            alreadyInGroup: "▸ ◉ هذا المستخدم موجود بالفعل في المجموعة",
            successAdd: "▸ ◉ تم إضافة %1 مستخدمين بنجاح للمجموعة",
            failedAdd: "▸ ◉ فشل إضافة %1 مستخدمين للمجموعة",
            approve: "▸ ◉ تم وضع %1 مستخدمين في قائمة الانتظار",
            invalidLink: "▸ ◉ يرجى إدخال رابط فيسبوك صحيح",
            cannotGetUid: "▸ ◉ لا يمكن الحصول على UID لهذا المستخدم",
            linkNotExist: "▸ ◉ رابط الملف الشخصي غير موجود",
            cannotAddUser: "▸ ◉ تم حظر البوت أو المستخدم يمنع إضافته للمجموعة",
            replyEmpty: "▸ ◉ يرجى الرد على رسالة شخص لتتمكن من إضافته"
        }
    },

    onStart: async function ({ message, api, event, args, threadsData, getLang }) {
        const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
        const botID = api.getCurrentUserID();

        const success = [
            { type: "نجاح", uids: [] },
            { type: "انتظار موافقة", uids: [] }
        ];
        const failed = [];

        function checkErrorAndPush(messageError, item) {
            item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
            const findType = failed.find(error => error.type == messageError);
            if (findType)
                findType.uids.push(item);
            else
                failed.push({ type: messageError, uids: [item] });
        }

        const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
        let userList = [];

        // إذا الرد موجود، خذ UID من الرسالة
        if (event.type === "message_reply" && event.messageReply) {
            userList.push(event.messageReply.senderID);
        }

        // خذ UID من الروابط أو الأرقام
        for (const item of args) userList.push(item);

        if (!userList.length) {
            return api.sendMessage(getLang("replyEmpty"), event.threadID);
        }

        for (const item of userList) {
            let uid;
            let continueLoop = false;

            if (isNaN(item) && regExMatchFB.test(item)) {
                for (let i = 0; i < 10; i++) {
                    try {
                        uid = await findUid(item);
                        break;
                    } catch (err) {
                        if (err.name == "SlowDown" || err.name == "CannotGetData") {
                            await sleep(1000);
                            continue;
                        } else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
                            checkErrorAndPush(
                                err.name == "InvalidLink" ? getLang('invalidLink') :
                                err.name == "CannotGetData" ? getLang('cannotGetUid') :
                                err.name == "LinkNotExist" ? getLang('linkNotExist') :
                                err.message,
                                item
                            );
                            continueLoop = true;
                            break;
                        }
                    }
                }
            } else if (!isNaN(item)) uid = item;
            else continue;

            if (continueLoop) continue;

            // حتى لو الشخص مطرود
            try {
                await api.addUserToGroup(uid, event.threadID);
                if (approvalMode && !adminIDs.includes(botID))
                    success[1].uids.push(uid);
                else
                    success[0].uids.push(uid);
            } catch {
                checkErrorAndPush(getLang("cannotAddUser"), item);
            }
        }

        let msg = "";
        if (success[0].uids.length) msg += `${getLang("successAdd", success[0].uids.length)}\n`;
        if (success[1].uids.length) msg += `${getLang("approve", success[1].uids.length)}\n`;
        if (failed.length) msg += `${getLang("failedAdd", failed.reduce((a, b) => a + b.uids.length, 0))} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('\n       ')}: ${b.type}`, "")}`;

        await message.reply(msg);
    }
};