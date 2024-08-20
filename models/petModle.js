const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for the cat'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Please provide an age for the cat']
    },
    breed: {
        type: String,
        required: [true, 'Please provide a breed for the cat'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for the cat'],
        trim: true
    },
    adoptionStatus: {
        type: String,
        enum: ['Available', 'Adopted', 'Pending'],
        default: 'Available'
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
        type: [String],
        validate: {
            validator: function (val) {
                return val.length <= 3;
            },
            message: 'A cat can have up to 3 images'
        }
    },
    location: {
        type: String,
        required: [true, 'Please provide a location']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        validate: {
            validator: function (val) {
                return /\d{10,15}/.test(val);
            },
            message: 'Please provide a valid phone number'
        }
    }
});

const Cat = mongoose.model('Cat', catSchema);

module.exports = Cat;
