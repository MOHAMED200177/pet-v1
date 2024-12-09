const Customer = require('../modles/CustomerModle');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const { isValidObjectId } = require('mongoose');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    if (!isValidObjectId(req.user.id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1- error if posted password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    // allowed to be updated
    const filteredBody = filterObj(req.body, "name", "photo", "address", "city", "phone");

    if (req.file) {
        filteredBody.photo = req.file.path;
    }

    // update data
    const updatedUser = await Customer.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    // Check if user was found and updated
    if (!updatedUser) {
        return next(new AppError('No user found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});



exports.getAllUsers = factory.getAll(Customer);
exports.getUser = factory.getOne(Customer, [{
    path: 'pet',
    select: 'name age gender description imageUrl '
}]
);
exports.deleteUser = factory.deleteOne(Customer);
