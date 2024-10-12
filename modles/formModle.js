const mongoose = require('mongoose');

const adoptionFormSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    job: {
        hasJob: {
            type: Boolean,
            required: true,
        },
        jobTitle: {
            type: String,
            trim: true,
        },
    },
    homeLocation: {
        type: String,
        enum: ['Urban', 'Rural', 'Homeless'],
        required: true,
    },
    animalExperience: {
        type: Boolean,
        required: true,
    },
    understandsSocializing: {
        type: Boolean,
        required: true,
    },
    additionalHelpers: {
        type: Boolean,
        required: true,
    },
    budgetForAnimalCare: {
        type: Boolean,
        required: true,
    },
}, {
    timestamps: true,
});

const AdoptionForm = mongoose.model('AdoptionForm', adoptionFormSchema);

module.exports = AdoptionForm;
