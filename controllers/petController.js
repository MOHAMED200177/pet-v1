const Pet = require('../modles/petModle');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const uploud = require('./../utils/multer');
const factory = require('./handlerFactory');


exports.createPet = catchAsync(async (req, res) => {
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
        dateAdded: Date.now()
    };

    const newPet = await Pet.create(data);

    res.status(201).json({
        status: 'success',
        data: {
            newPet
        }
    });
});

exports.getAllPets = catchAsync(async (req, res) => {
    const features = new APIFeatures(Pet.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const pets = await features.query;

    res.status(200).json({
        status: 'success',
        results: pets.length,
        data: {
            pets
        }
    });
});

// exports.getCat = catchAsync(async (req, res) => {
//     const cat = await Cat.findById(req.params.id);

//     if (!cat) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Cat not found'
//         });
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             cat
//         }
//     });
// });

// exports.updateCat = catchAsync(async (req, res) => {
//     const cat = await Cat.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });

//     if (!cat) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Cat not found'
//         });
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             cat
//         }
//     });
// });

// exports.deleteCat = catchAsync(async (req, res) => {
//     const cat = await Cat.findById(req.params.id);

//     if (!cat) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Cat not found'
//         });
//     }

//     await Cat.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// });