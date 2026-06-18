const Pet = require('../modles/petModle');
const Customer = require('../modles/CustomerModle');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


exports.createPet = catchAsync(async (req, res, next) => {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => file.path); // Cloudinary stores URL in path
    }

    const data = {
        name: req.body.name,
        age: req.body.age,
        type: req.body.type,
        breed: req.body.breed,
        description: req.body.description,
        imageUrl: imageUrls,
        typeWeight: req.body.typeWeight,
        weight: req.body.weight,
        gender: req.body.gender,
        color: req.body.color,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        user: req.user._id,
        dateAdded: Date.now()
    };

    // Create the new pet document
    const newPet = await Pet.create(data);

    // Update the customer and push the new pet's _id to the 'pet' array
    const updatedCustomer = await Customer.findByIdAndUpdate(
        req.user.id,
        { $push: { pet: newPet._id } },
        { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
        return next(new AppError('No customer found with that ID', 404));
    }

    res.status(201).json({
        status: 'success',
        data: {
            data: newPet
        }
    });
});

exports.getAllPets = factory.getAll(Pet);
exports.getPet = factory.getOne(Pet, {
    path: 'user',
    select: 'name email'
});

// FIX: previously referenced an undefined `Model`, which threw a
// ReferenceError on every PATCH /api/v1/pets/:id request. Now correctly
// updates the Pet document and, if new images were uploaded, replaces
// imageUrl with the newly uploaded files; otherwise leaves existing images
// untouched.
exports.updatePet = catchAsync(async (req, res, next) => {
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
        updateData.imageUrl = req.files.map(file => file.path);
    } else {
        // don't overwrite existing images with an empty array if none were sent
        delete updateData.imageUrl;
    }

    const doc = await Pet.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.deletePet = factory.deleteOne(Pet);
