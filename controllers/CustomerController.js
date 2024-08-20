const Customer = require('../modles/CustomerModle');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// exports.createCustomer = async (req, res) => {
//     try {
//         const newCustomer = await Customer.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 customer: newCustomer
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await Customer.find();

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});


exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({
                status: 'fail',
                message: 'No customer found with that ID'
            });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};