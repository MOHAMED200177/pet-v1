const Cat = require('./../models/petModle');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.createCat = catchAsync(async (req, res) => {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => file.path); // Cloudinary stores URL in path
    }

    const newCatData = {
        name: req.body.name,
        age: req.body.age,
        breed: req.body.breed,
        description: req.body.description,
        adoptionStatus: req.body.adoptionStatus || 'Available',
        imageUrl: imageUrls,
        location: req.body.location,
        // email: req.body.email,
        // phone: req.body.phone,
        dateAdded: Date.now()
    };

    const newCat = await Cat.create(newCatData);

    res.status(201).json({
        status: 'success',
        data: {
            cat: newCat
        }
    });
});

exports.getAllCats = catchAsync(async (req, res) => {
    const features = new APIFeatures(Cat.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const cats = await features.query;

    res.status(200).json({
        status: 'success',
        results: cats.length,
        data: {
            cats
        }
    });
});

exports.getCat = catchAsync(async (req, res) => {
    const cat = await Cat.findById(req.params.id);

    if (!cat) {
        return res.status(404).json({
            status: 'fail',
            message: 'Cat not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            cat
        }
    });
});

exports.updateCat = catchAsync(async (req, res) => {
    const cat = await Cat.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!cat) {
        return res.status(404).json({
            status: 'fail',
            message: 'Cat not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            cat
        }
    });
});

exports.deleteCat = catchAsync(async (req, res) => {
    const cat = await Cat.findById(req.params.id);

    if (!cat) {
        return res.status(404).json({
            status: 'fail',
            message: 'Cat not found'
        });
    }

    await Cat.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});