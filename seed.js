/**
 * Petopia — Database Seeder
 * ========================
 * يقرأ ملفات JSON من مجلد /data ويرفعهم على MongoDB.
 *
 * الاستخدام:
 *   node seed.js --import      ← يمسح الداتا القديمة ويرفع الجديدة
 *   node seed.js --delete      ← يمسح كل الداتا بس من غير ما يرفع
 *
 * المتطلبات:
 *   - npm install mongoose dotenv bcryptjs
 *   - ملف .env/config.env موجود في نفس المجلد اللي شغال منه الباك إند
 *     وفيه DATABASE و DATABASE_PASS
 *
 * ملاحظة مهمة بخصوص الباسورد:
 *   كل المستخدمين في customers.json عندهم باسورد هاش جاهز
 *   لكن الهاش ده مش صالح فعلاً (placeholder) — السكريبت ده بيعمل
 *   hash صحيح تلقائياً للباسورد "Test@12345" لكل المستخدمين أثناء الرفع.
 *   يعني بعد الـ seed تقدر تسجّل دخول بأي إيميل من الملف بباسورد: Test@12345
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── load env ──────────────────────────────────────────────────────────────
// حاول يلاقي config.env في المكانين المحتملين
const envPaths = [
  path.join(__dirname, '.env'),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    console.log(`✅ Loaded env from: ${p}`);
    break;
  }
}

if (!process.env.DATABASE_PASS) {
  console.error('❌ DATABASE env variable not found. Check your .env/config.env path.');
  process.exit(1);
}

// ─── connect ────────────────────────────────────────────────────────────────
const DB = process.env.DATABASE_PASS;

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log('✅ DB connected'))
  .catch((err) => { console.error('❌ DB connection failed:', err.message); process.exit(1); });

// ─── inline minimal schemas (no pre-save hooks that cause issues during seeding) ──
const customerSchema = new mongoose.Schema({
  name:                   { type: String },
  email:                  { type: String, lowercase: true },
  photo:                  { type: String, default: 'https://res.cloudinary.com/dgqfotpys/image/upload/v1736020548/pet/iw24r4t2hchwa4kkcisi.jpg' },
  role:                   { type: String, enum: ['user', 'admin'], default: 'user' },
  address:                { type: String },
  city:                   { type: String },
  phone:                  { type: Number },
  pet:                    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  password:               { type: String },
  passwordConfirm:        { type: String },
  passwordChangedAt:      Date,
  passwordResetToken:     String,
  passwordResetExpires:   Date,
  active:                 { type: Boolean, default: true },
  emailVerified:          { type: Boolean, default: false },
  verificationToken:      String,
  verificationTokenExpires: Date,
  tokenInvalidationTime:  Date,
}, { strict: false });

const petSchema = new mongoose.Schema({
  name:         String,
  age:          Number,
  type:         String,
  breed:        String,
  typeWeight:   String,
  weight:       Number,
  gender:       String,
  color:        String,
  description:  String,
  dateAdded:    { type: Date, default: Date.now },
  imageUrl:     [String],
  address:      String,
  city:         String,
  phone:        Number,
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
}, { strict: false });

const adoptionFormSchema = new mongoose.Schema({
  fullName:              String,
  email:                 String,
  phoneNumber:           String,
  job:                   { hasJob: Boolean, jobTitle: String },
  homeLocation:          String,
  animalExperience:      Boolean,
  understandsSocializing: Boolean,
  additionalHelpers:     Boolean,
  budgetForAnimalCare:   Boolean,
}, { strict: false });

// استخدم نفس collection names اللي الباك إند بيستخدمها
const Customer     = mongoose.model('Customer',     customerSchema, 'customers');
const Pet          = mongoose.model('Pet',          petSchema,          'pets');
const AdoptionForm = mongoose.model('AdoptionForm', adoptionFormSchema, 'adoptionforms');

// ─── read JSON files ────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
const rawCustomers     = JSON.parse(fs.readFileSync(path.join(dataDir, 'customers.json'),     'utf-8'));
const rawPets          = JSON.parse(fs.readFileSync(path.join(dataDir, 'pets.json'),          'utf-8'));
const rawAdoptionForms = JSON.parse(fs.readFileSync(path.join(dataDir, 'adoptionForms.json'), 'utf-8'));

// ─── helpers ────────────────────────────────────────────────────────────────
function toObjectId(value) {
  if (!value) return undefined;
  if (typeof value === 'string') return new mongoose.Types.ObjectId(value);
  if (value && value.$oid)       return new mongoose.Types.ObjectId(value.$oid);
  return value;
}

function toDate(value) {
  if (!value) return undefined;
  if (value && value.$date) return new Date(value.$date);
  return new Date(value);
}

// ─── import ─────────────────────────────────────────────────────────────────
async function importData() {
  try {
    console.log('\n⏳ Hashing passwords…');
    const PLAIN_PASSWORD = 'Test@12345';
    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 12);

    const customers = rawCustomers.map((c) => ({
      ...c,
      _id:      toObjectId(c._id),
      pet:      (c.pet || []).map(toObjectId),
      password: hashed,
      passwordConfirm: undefined,
    }));

    const pets = rawPets.map((p) => ({
      ...p,
      _id:       toObjectId(p._id),
      user:      toObjectId(p.user),
      dateAdded: toDate(p.dateAdded),
    }));

    console.log('⏳ Clearing existing data…');
    await Customer.deleteMany();
    await Pet.deleteMany();
    await AdoptionForm.deleteMany();

    console.log('⏳ Inserting customers…');
    await Customer.insertMany(customers, { ordered: false });

    console.log('⏳ Inserting pets…');
    await Pet.insertMany(pets, { ordered: false });

    console.log('⏳ Inserting adoption forms…');
    await AdoptionForm.insertMany(rawAdoptionForms, { ordered: false });

    console.log(`
✅ Seed complete!
─────────────────────────────────────
  👥 Customers : ${customers.length}
  🐾 Pets      : ${pets.length}
  📋 Forms     : ${rawAdoptionForms.length}
─────────────────────────────────────
Login credentials (all users):
  Password: ${PLAIN_PASSWORD}

  admin@petopia.com   ← role: admin
  sara@example.com
  mohamed@example.com
  layla@example.com
  omar@example.com
─────────────────────────────────────`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err.message);
    if (err.writeErrors) {
      err.writeErrors.forEach((e) => console.error(' •', e.errmsg));
    }
    process.exit(1);
  }
}

// ─── delete only ────────────────────────────────────────────────────────────
async function deleteData() {
  try {
    console.log('⏳ Deleting all data…');
    await Customer.deleteMany();
    await Pet.deleteMany();
    await AdoptionForm.deleteMany();
    console.log('✅ All data deleted.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Delete failed:', err.message);
    process.exit(1);
  }
}

// ─── entry point ────────────────────────────────────────────────────────────
const arg = process.argv[2];
if (arg === '--import') {
  mongoose.connection.once('open', importData);
} else if (arg === '--delete') {
  mongoose.connection.once('open', deleteData);
} else {
  console.log(`
Usage:
  node seed.js --import    ← clear + seed all data
  node seed.js --delete    ← clear data only
`);
  process.exit(0);
}
