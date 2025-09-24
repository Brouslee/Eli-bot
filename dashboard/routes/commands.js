const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const path = require("path");
const rateLimit = require("express-rate-limit");

// تحديد معدل الطلبات للعمليات الحساسة
const commandsRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 دقائق
    max: 10, // 10 عمليات كحد أقصى
    message: {
        status: "error",
        message: "تم تجاوز عدد العمليات المسموحة. يرجى المحاولة لاحقاً."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = function ({ isAuthenticated, isVeryfiUserIDFacebook, isAdmin, config }) {
    router
        .get("/", [isAuthenticated, isVeryfiUserIDFacebook, isAdmin], async (req, res) => {
            try {
                // قراءة الأوامر من مجلد scripts/cmds
                const commandsPath = path.join(process.cwd(), 'scripts', 'cmds');
                const disabledPath = path.join(commandsPath, 'disabled');
                
                // التأكد من وجود المجلدات
                await fs.ensureDir(commandsPath);
                await fs.ensureDir(disabledPath);
                
                const commands = [];
                
                // قراءة الأوامر المفعلة
                try {
                    const enabledFiles = await fs.readdir(commandsPath);
                    const enabledJsFiles = enabledFiles.filter(file => file.endsWith('.js'));
                    
                    for (const file of enabledJsFiles) {
                        try {
                            const commandPath = path.join(commandsPath, file);
                            const commandContent = await fs.readFile(commandPath, 'utf8');
                            
                            const command = {
                                fileName: file,
                                name: file.replace('.js', ''),
                                size: (await fs.stat(commandPath)).size,
                                enabled: true,
                                lastModified: (await fs.stat(commandPath)).mtime,
                                description: extractDescription(commandContent),
                                category: extractCategory(commandContent) || 'غير محدد'
                            };
                            
                            commands.push(command);
                        } catch (error) {
                            console.error(`خطأ في قراءة الأمر المفعل ${file}:`, error);
                        }
                    }
                } catch (error) {
                    console.error('خطأ في قراءة المجلد المفعل:', error);
                }
                
                // قراءة الأوامر المعطلة
                try {
                    const disabledFiles = await fs.readdir(disabledPath);
                    const disabledJsFiles = disabledFiles.filter(file => file.endsWith('.js'));
                    
                    for (const file of disabledJsFiles) {
                        try {
                            const commandPath = path.join(disabledPath, file);
                            const commandContent = await fs.readFile(commandPath, 'utf8');
                            
                            const command = {
                                fileName: file,
                                name: file.replace('.js', ''),
                                size: (await fs.stat(commandPath)).size,
                                enabled: false,
                                lastModified: (await fs.stat(commandPath)).mtime,
                                description: extractDescription(commandContent),
                                category: extractCategory(commandContent) || 'غير محدد'
                            };
                            
                            commands.push(command);
                        } catch (error) {
                            console.error(`خطأ في قراءة الأمر المعطل ${file}:`, error);
                        }
                    }
                } catch (error) {
                    console.error('خطأ في قراءة المجلد المعطل:', error);
                }
                
                // ترتيب الأوامر حسب الاسم
                commands.sort((a, b) => a.name.localeCompare(b.name));
                
                res.render("commands-management", { 
                    commands,
                    totalCommands: commands.length,
                    enabledCommands: commands.filter(cmd => cmd.enabled).length,
                    success: req.flash("success"),
                    errors: req.flash("errors")
                });
            } catch (error) {
                req.flash("errors", { msg: "خطأ في قراءة الأوامر" });
                res.redirect("/dashboard");
            }
        })
        .post("/toggle/:commandName", [commandsRateLimit, isAuthenticated, isVeryfiUserIDFacebook, isAdmin], async (req, res) => {
            try {
                const { commandName } = req.params;
                const { action } = req.body; // enable, disable, delete
                
                const commandPath = path.join(process.cwd(), 'scripts', 'cmds', `${commandName}.js`);
                
                if (!await fs.pathExists(commandPath)) {
                    return res.json({ success: false, message: "الأمر غير موجود" });
                }
                
                switch (action) {
                    case 'disable':
                        // نقل الملف إلى مجلد disabled
                        const disabledPath = path.join(process.cwd(), 'scripts', 'cmds', 'disabled');
                        await fs.ensureDir(disabledPath);
                        await fs.move(commandPath, path.join(disabledPath, `${commandName}.js`));
                        res.json({ success: true, message: `تم تعطيل الأمر ${commandName}` });
                        break;
                        
                    case 'enable':
                        // نقل الملف من مجلد disabled
                        const disabledFilePath = path.join(process.cwd(), 'scripts', 'cmds', 'disabled', `${commandName}.js`);
                        if (await fs.pathExists(disabledFilePath)) {
                            await fs.move(disabledFilePath, commandPath);
                            res.json({ success: true, message: `تم تفعيل الأمر ${commandName}` });
                        } else {
                            res.json({ success: false, message: "الأمر غير موجود في المجلد المعطل" });
                        }
                        break;
                        
                    case 'delete':
                        // نسخة احتياطية قبل الحذف
                        const backupPath = path.join(process.cwd(), 'scripts', 'cmds', 'backup');
                        await fs.ensureDir(backupPath);
                        await fs.copy(commandPath, path.join(backupPath, `${commandName}_${Date.now()}.js`));
                        await fs.remove(commandPath);
                        res.json({ success: true, message: `تم حذف الأمر ${commandName} مع عمل نسخة احتياطية` });
                        break;
                        
                    default:
                        res.json({ success: false, message: "عملية غير مدعومة" });
                }
                
            } catch (error) {
                console.error("خطأ في تبديل حالة الأمر:", error);
                res.json({ success: false, message: "خطأ في العملية: " + error.message });
            }
        })
        .post("/upload", [commandsRateLimit, isAuthenticated, isVeryfiUserIDFacebook, isAdmin], async (req, res) => {
            try {
                if (!req.files || !req.files.commandFile) {
                    req.flash("errors", { msg: "يرجى اختيار ملف للرفع" });
                    return res.redirect("/dashboard/commands");
                }
                
                const uploadedFile = req.files.commandFile;
                
                // التحقق من نوع الملف
                if (!uploadedFile.name.endsWith('.js')) {
                    req.flash("errors", { msg: "يجب أن يكون الملف من نوع .js" });
                    return res.redirect("/dashboard/commands");
                }
                
                // التحقق من حجم الملف (الحد الأقصى 1MB)
                if (uploadedFile.size > 1024 * 1024) {
                    req.flash("errors", { msg: "حجم الملف كبير جداً (الحد الأقصى 1MB)" });
                    return res.redirect("/dashboard/commands");
                }
                
                // تنظيف اسم الملف وحمايته من مسارات ضارة
                const sanitizedName = path.basename(uploadedFile.name);
                if (sanitizedName !== uploadedFile.name) {
                    req.flash("errors", { msg: "اسم الملف يحتوي على أحرف غير مسموحة" });
                    return res.redirect("/dashboard/commands");
                }
                
                // التحقق من صحة اسم الملف
                if (!/^[a-zA-Z0-9_\u0600-\u06FF-]+\.js$/.test(sanitizedName)) {
                    req.flash("errors", { msg: "اسم الملف يجب أن يحتوي على أحرف وأرقام فقط" });
                    return res.redirect("/dashboard/commands");
                }
                
                // حفظ الملف
                const commandsPath = path.join(process.cwd(), 'scripts', 'cmds');
                const enabledPath = path.join(commandsPath, sanitizedName);
                const disabledPath = path.join(commandsPath, 'disabled', sanitizedName);
                
                // التحقق من وجود الملف في أي من المجلدين
                if (await fs.pathExists(enabledPath) || await fs.pathExists(disabledPath)) {
                    req.flash("errors", { msg: "الأمر موجود بالفعل" });
                    return res.redirect("/dashboard/commands");
                }
                
                await uploadedFile.mv(enabledPath);
                req.flash("success", { msg: `تم رفع الأمر ${sanitizedName} بنجاح` });
                res.redirect("/dashboard/commands");
                
            } catch (error) {
                console.error("خطأ في رفع الأمر:", error);
                req.flash("errors", { msg: "خطأ في رفع الأمر: " + error.message });
                res.redirect("/dashboard/commands");
            }
        });

    return router;
};

// دوال مساعدة لاستخراج معلومات الأوامر
function extractDescription(content) {
    // محاولة استخراج الوصف من تعليقات الكود أو config
    const descMatch = content.match(/description:\s*["']([^"']*)["']/);
    if (descMatch) return descMatch[1];
    
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
        const comment = commentMatch[0];
        const lines = comment.split('\n').map(line => line.trim().replace(/^\*\s?/, ''));
        return lines.slice(1, -1).join(' ').trim().substring(0, 100) + '...';
    }
    
    return 'بدون وصف';
}

function extractCategory(content) {
    const categoryMatch = content.match(/category:\s*["']([^"']*)["']/);
    return categoryMatch ? categoryMatch[1] : null;
}