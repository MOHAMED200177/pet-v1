const Pet = require('../modles/petModle');
const Customer = require('../modles/CustomerModle');
const catchAsync = require('./../utils/catchAsync');
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
            newPet
        }
    });
});

exports.getAllPets = factory.getAll(Pet);
exports.getPet = factory.getOne(Pet, {
    path: 'user',
    select: 'name email'
});
// exports.updatePet = factory.updateOne(Pet);

exports.updatePet = catchAsync(async (req, res, next) => {
    // allowed to be updated
    // const filteredBody = filterObj(req.body, "name", "photo", "address", "city", "phone");

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => file.path); // Cloudinary stores URL in path
    }

    req.body.imageUrl = imageUrls;
    // update data
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
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