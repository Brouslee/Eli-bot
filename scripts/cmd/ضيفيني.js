module.exports = {  
  config: {  
    name: "ضيفيني",  
    version: "1.0",  
    author: "Kshitiz",  
    countDown: 5,  
    role: 0,  
    shortDescription: "قم بالإنضمام إلى المجموعة عن طريق كتابة الآيدي",  
    longDescription: "استخدم هذا الأمر مع آيدي المجموعة مباشرة ليتم إضافتك إليها",  
    category: "المالك",  
    guide: {  
      ar: "{p}{n} <آيدي المجموعة>"  
    },  
  },  

  onStart: async function ({ api, event, args }) {  
    if (!args[0]) {  
      api.sendMessage("❌ | الرجاء كتابة آيدي المجموعة", event.threadID, event.messageID);  
      return;  
    }  

    const groupID = args[0];  

    try {  
      const groupInfo = await api.getThreadInfo(groupID);  

      if (groupInfo.participantIDs.includes(event.senderID)) {  
        api.sendMessage(`⚠️ | أنت موجود بالفعل في هذه المجموعة`, event.threadID, event.messageID);  
        return;  
      }  

      if (groupInfo.participantIDs.length >= 250) {  
        api.sendMessage(`⚠️ | لايمكن إضافتك لأن المجموعة ممتلئة`, event.threadID, event.messageID);  
        return;  
      }  

      await api.addUserToGroup(event.senderID, groupID);  
      api.sendMessage(`✅ | تمت إضافتك إلى المجموعة بنجاح`, event.threadID, event.messageID);  

    } catch (error) {  
      console.error("Error joining group", error);  
      api.sendMessage("❌ | حدث خطأ أثناء محاولة الانضمام. تأكد من صحة الآيدي", event.threadID, event.messageID);  
    }  
  },  
};