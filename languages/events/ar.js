module.exports = {  
	// You can customize the language here or directly in the command files  
	autoUpdateThreadInfo: {},  
	checkwarn: {  
		text: {  
			warn: "▸ ◉ العضو %1 تم تحذيره 3 مرات مسبقًا وتم حظره من المحادثة\n│ الاسم: %1\n│ Uid: %2\n│ لإلغاء الحظر استخدم الأمر \"%3warn unban <uid>\" (uid هو معرف العضو)",  
			needPermission: "▸ ◉ يحتاج البوت إلى صلاحيات الأدمن لطرد الأعضاء المحظورين"  
		}  
	},  
	leave: {  
		text: {  
			session1: "morning",  
			session2: "noon",  
			session3: "afternoon",  
			session4: "evening",  
			leaveType1: "▸ ◉ غادر المجموعة",  
			leaveType2: "▸ ◉ تم طرده من المجموعة"  
		}  
	},  
	logsbot: {  
		text: {  
			title: "====== Bot logs ======",  
			added: "▸ ✅\nحدث: تم إضافة البوت إلى مجموعة جديدة\n│ بواسطة: %1",  
			kicked: "▸ ❌\nحدث: تم طرد البوت\n│ بواسطة: %1",  
			footer: "│ معرف المستخدم: %1\n│ المجموعة: %2\n│ معرف المجموعة: %3\n│ الوقت: %4"  
		}  
	},  
	onEvent: {},  
	welcome: {  
		text: {  
			session1: "morning",  
			session2: "noon",  
			session3: "afternoon",  
			session4: "evening",  
			welcomeMessage: "▸ ◉ شكرًا لدعوتي للمجموعة!\n│ بادئة البوت: %1\n│ لعرض قائمة الأوامر، الرجاء إدخال: %1help",  
			multiple1: "أنت",  
			multiple2: "أنتم"  
		}  
	},  
	commands: {  
		restartBot: {  
			text: {  
				starting: "▸ ◉ جارٍ إعادة تشغيل البوت...\n│ يرجى الانتظار قليلًا",  
				success: "▸ ◉ تمت إعادة التشغيل بنجاح\n│ المدة: %1 ثانية\n│ البوت جاهز الآن"  
			}  
		}  
	}  
};
