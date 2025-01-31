require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usersFile = path.join(__dirname, 'users.json');

// التأكد من أن ملف المستخدمين موجود
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

// إعداد خدمة البريد الإلكتروني
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        EMAIL_USER=hacenatek9@gmail.com
EMAIL_PASS=hmhi fvrk nghr gdxd
}

// مسار تسجيل المستخدمين
app.post('/api/subscribe', async (req, res) => {
    const { name, email, password } = req.body;

    // التحقق من الحقول المدخلة
    if (!name || !email || !password) {
        return res.status(400).json({ message: '⚠️ جميع الحقول مطلوبة!' });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '⚠️ البريد الإلكتروني غير صحيح.' });
    }

    try {
        let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

        // التحقق إذا كان البريد الإلكتروني مسجلًا مسبقًا
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ message: '⚠️ البريد الإلكتروني مسجل مسبقًا.' });
        }

        // تجزئة كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إضافة المستخدم الجديد
        const newUser = { name, email, password: hashedPassword, registeredAt: new Date().toISOString() };
        users.push(newUser);

        // حفظ البيانات في الملف
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        // إرسال بريد تأكيد التسجيل
        const mailOptions = {
            from: 'your-email@gmail.com',  // بريد المرسل
            to: email,
            subject: 'تم التسجيل بنجاح',
            text: `مرحبًا ${name}،\n\nلقد تم تسجيلك بنجاح في النظام. شكرًا لاستخدامك خدمتنا!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ خطأ في إرسال البريد:', error);
            } else {
                console.log('✅ تم إرسال البريد:', info.response);
            }
        });

        // رد على العميل بأن التسجيل تم بنجاح
        res.status(201).json({ message: '✅ تم التسجيل بنجاح وتم إرسال بريد التأكيد!' });

    } catch (error) {
        // التعامل مع الأخطاء
        console.error('❌ خطأ في تسجيل المستخدم:', error);
        res.status(500).json({ message: '❌ حدث خطأ أثناء التسجيل.' });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
});
