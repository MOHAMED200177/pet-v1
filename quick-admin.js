/**
 * quick-admin.js
 * --------------
 * بيمسح كل الـ customers وبيعمل admin user واحد صح
 * عن طريق الـ Mongoose model الحقيقي (مع الـ pre-save hook)
 * عشان الباسورد يتـ hash صح زي ما الباك إند بيتوقع.
 *
 * الاستخدام (من مجلد الباك إند):
 *   node quick-admin.js
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// load env
const envPaths = [
  path.join(__dirname, '.env'),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    console.log('✅ env loaded from:', p);
    break;
  }
}

const mongoose = require('mongoose');
const Customer = require('./modles/CustomerModle'); // الموديل الحقيقي

const DB = process.env.DATABASE_PASS;


mongoose
  .connect(DB, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('✅ DB connected'))
  .catch((err) => { console.error('❌ DB error:', err.message); process.exit(1); });

mongoose.connection.once('open', async () => {
  try {
    // امسح أي admin قديم بنفس الإيميل عشان ما يتعملش duplicate
    await Customer.deleteOne({ email: 'admin@petopia.com' });

    const admin = await Customer.create({
      name:            'Admin Petopia',
      email:           'admin@petopia.com',
      password:        'Test@12345',
      passwordConfirm: 'Test@12345',
      role:            'admin',
      address:         '123 Shelter Street',
      city:            'Cairo',
      phone:           "01012345678",
      emailVerified:   true,
    });

    console.log(`
✅ Admin created successfully!
──────────────────────────────
  Email    : ${admin.email}
  Password : Test@12345
  Role     : ${admin.role}
──────────────────────────────
دلوقتي ادخل من الفرونت بالبيانات دي.
`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
});
