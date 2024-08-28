const Customer = require('../modles/CustomerModle');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.updateMe = catchAsync(async (req, res, next) => {
    // 1- error if posted password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    };
    // allowed to be update
    const filteredBody = filterObj(req.body, "name", "email");

    // update data
    const updatedUser = await Customer.findByIdAndUpdate(req.customer.id, filteredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        Data: {
            user: updatedUser
        }
    });
});



exports.getAllUsers = factory.getAll(Customer);
exports.getUser = factory.getOne(Customer);
exports.deleteUser = factory.deleteOne(Customer);
