const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Please provide an age']
    },
    type: {
        type: String,
        enum: ['Cat', 'Dog'],
        required: [true, 'Please provide a type']
    },
    breed: {
        type: String,
        required: [true, 'Please provide a breed'],
        trim: true
    },
    typeWeight: {
        type: String,
        enum: ['kilogram', 'pound'],
        default: 'kilogram'
    },
    weight: {
        type: Number,
        required: [true, 'Please provide a weight']
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Please provide a gender']
    },
    color: {
        type: String,
        enum: ['black', 'white', 'gray', 'brown', 'orange', 'cream'],
        required: [true, 'Please provide a color']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
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
        },
        required: [true, 'Please provide an image'],
    },
    address: {
        type: String,
        required: [true, 'Please provide an address'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
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
        required: [true, 'Please provide a phone'],
    }
});

const Cat = mongoose.model('Cat', petSchema);

module.exports = Cat;
