# Petopia — Database Seeder

## الملفات
```
seed/
  seed.js              ← السكريبت الرئيسي
  data/
    customers.json     ← 5 مستخدمين (1 admin + 4 users)
    pets.json          ← 10 حيوانات (6 كلاب + 4 قطط)
    adoptionForms.json ← 3 طلبات تبني
```

## الخطوات

### 1. ضع مجلد `seed` جوا مجلد الباك إند

```
your-backend/
  seed/
    seed.js
    data/
      customers.json
      pets.json
      adoptionForms.json
```

### 2. ثبّت الـ dependencies لو مش موجودة

```bash
cd your-backend
npm install dotenv bcryptjs
```

### 3. شغّل السكريبت

```bash
node seed/seed.js --import
```

### 4. النتيجة المتوقعة

```
✅ Seed complete!
─────────────────────────────────────
  👥 Customers : 5
  🐾 Pets      : 10
  📋 Forms     : 3
─────────────────────────────────────
Login credentials (all users):
  Password: Test@12345

  admin@petopia.com   ← role: admin
  sara@example.com
  mohamed@example.com
  layla@example.com
  omar@example.com
```

## مسح الداتا بس (من غير إعادة رفع)

```bash
node seed/seed.js --delete
```

## ملاحظات

- السكريبت بيمسح **كل** بيانات customers و pets و adoptionForms قبل ما يرفع الجديدة.
- الباسورد لكل المستخدمين هو `Test@12345` — السكريبت بيعمل bcrypt hash تلقائياً.
- الصور المستخدمة هي Cloudinary placeholder image من نفس الباك إند.
- الـ IDs ثابتة في الـ JSON عشان العلاقات (customer → pets array) تكون صح.
