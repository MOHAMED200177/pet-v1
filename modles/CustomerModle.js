const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    address: {
        type: String,
        // required: [true, 'Please provide an address'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true
    },
    phone: {
        type: Number,
        required: [true, 'Please provide a phone number'],
        validate: {
            validator: function (val) {
                return /\d{10,15}/.test(val);
            },
            message: 'Please provide a valid phone number'
        },
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    tokenInvalidationTime: Date
});

customerSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

customerSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.tokenInvalidationTime = Date.now() - 1000;
    next();
});

customerSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

customerSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

customerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

customerSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};
customerSchema.methods.createVerificationToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.verificationToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.verificationToken);

    this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
