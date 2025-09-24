const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const path = require("path");
const rateLimit = require("express-rate-limit");

// تحديد معدل الطلبات للمسارات الحساسة
const settingsRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // 5 محاولات كحد أقصى
    message: {
        status: "error",
        message: "تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = function ({ isAuthenticated, isVeryfiUserIDFacebook, isAdmin, config }) {
    router
        .get("/", [isAuthenticated, isVeryfiUserIDFacebook, isAdmin], async (req, res) => {
            try {
                // قراءة الإعدادات الحالية
                const configPath = path.join(process.cwd(), 'config.json');
                const configData = await fs.readJson(configPath);
                
                res.render("bot-settings", { 
                    config: configData,
                    success: req.flash("success"),
                    errors: req.flash("errors")
                });
            } catch (error) {
                req.flash("errors", { msg: "خطأ في قراءة ملف الإعدادات" });
                res.redirect("/dashboard");
            }
        })
        .post("/", [settingsRateLimit, isAuthenticated, isVeryfiUserIDFacebook, isAdmin], async (req, res) => {
            try {
                const {
                    prefix,
                    nickNameBot,
                    language,
                    adminBot,
                    whiteListMode_enable,
                    whiteListIds,
                    whiteListModeThread_enable,
                    whiteListThreadIds,
                    autoRestart_time,
                    hideCommandNotFound,
                    hideAdminOnly,
                    hideThreadBanned,
                    hideUserBanned
                } = req.body;

                // التحقق من صحة البيانات
                if (!prefix || prefix.trim().length === 0) {
                    throw new Error("البادئة مطلوبة ولا يمكن أن تكون فارغة");
                }
                
                if (!nickNameBot || nickNameBot.trim().length === 0) {
                    throw new Error("اسم البوت مطلوب ولا يمكن أن يكون فارغ");
                }
                
                const allowedLanguages = ['ar', 'en', 'vi'];
                if (!allowedLanguages.includes(language)) {
                    throw new Error("اللغة المحددة غير مدعومة");
                }
                
                if (prefix.length > 10) {
                    throw new Error("البادئة طويلة جداً (الحد الأقصى 10 أحرف)");
                }

                const configPath = path.join(process.cwd(), 'config.json');
                const configData = await fs.readJson(configPath);

                // تحديث الإعدادات
                configData.prefix = prefix;
                configData.nickNameBot = nickNameBot;
                configData.language = language;
                
                // تحديث قائمة الأدمن (يجب أن تبقى strings)
                if (adminBot) {
                    const adminIds = adminBot.split(',').map(id => id.trim()).filter(id => id);
                    // التحقق من صحة معرفات الفيسبوك (أرقام فقط)
                    const validAdminIds = adminIds.filter(id => /^\d+$/.test(id));
                    if (validAdminIds.length !== adminIds.length) {
                        throw new Error("بعض معرفات المشرفين غير صحيحة. يجب أن تكون أرقام فقط.");
                    }
                    configData.adminBot = validAdminIds;
                }

                // تحديث إعدادات القائمة البيضاء للمستخدمين
                configData.whiteListMode.enable = whiteListMode_enable === 'true';
                if (whiteListIds) {
                    const ids = whiteListIds.split(',').map(id => id.trim()).filter(id => id);
                    configData.whiteListMode.whiteListIds = ids;
                }

                // تحديث إعدادات القائمة البيضاء للمجموعات
                configData.whiteListModeThread.enable = whiteListModeThread_enable === 'true';
                if (whiteListThreadIds) {
                    const threadIds = whiteListThreadIds.split(',').map(id => id.trim()).filter(id => id);
                    configData.whiteListModeThread.whiteListThreadIds = threadIds;
                }

                // تحديث إعدادات إعادة التشغيل التلقائي
                if (autoRestart_time) {
                    configData.autoRestart.time = parseInt(autoRestart_time) || null;
                }

                // تحديث إعدادات إخفاء الرسائل
                configData.hideNotiMessage.commandNotFound = hideCommandNotFound === 'true';
                configData.hideNotiMessage.adminOnly = hideAdminOnly === 'true';
                configData.hideNotiMessage.threadBanned = hideThreadBanned === 'true';
                configData.hideNotiMessage.userBanned = hideUserBanned === 'true';

                // التأكد من وجود الكائنات المطلوبة في الإعدادات
                if (!configData.whiteListMode) configData.whiteListMode = { enable: false, whiteListIds: [] };
                if (!configData.whiteListModeThread) configData.whiteListModeThread = { enable: false, whiteListThreadIds: [] };
                if (!configData.hideNotiMessage) configData.hideNotiMessage = {};
                if (!configData.autoRestart) configData.autoRestart = { time: null };

                // إنشاء نسخة احتياطية قبل الحفظ
                const backupPath = configPath + `.backup.${Date.now()}`;
                await fs.copy(configPath, backupPath);
                
                // حفظ التغييرات بطريقة آمنة (كتابة مؤقتة ثم نقل)
                const tempPath = configPath + '.tmp';
                await fs.writeJson(tempPath, configData, { spaces: 8 });
                await fs.move(tempPath, configPath);

                req.flash("success", { msg: "تم حفظ إعدادات البوت بنجاح! سيتم تطبيق التغييرات عند إعادة تشغيل البوت." });
                res.redirect("/dashboard/bot-settings");

            } catch (error) {
                console.error("خطأ في حفظ الإعدادات:", error);
                req.flash("errors", { msg: "خطأ في حفظ الإعدادات: " + error.message });
                res.redirect("/dashboard/bot-settings");
            }
        });

    return router;
};