const { promisify } = require('util');
const Customer = require('../modles/CustomerModle');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting token and check of it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    else if (!req.cookies || !req.cookies.jwt) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
        token = req.cookies.jwt;
    }


    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await Customer.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    if (currentUser.tokenInvalidationTime && currentUser.tokenInvalidationTime > decoded.iat * 1000) {
        return next(new AppError('This token is no longer valid. Please log in again.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
}
);



// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};



exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};

exports.signup = catchAsync(async (req, res, next) => {
    const customer = await Customer.findOne({ email: req.body.email });

    if (customer && !customer.verified) {
        customer.verificationToken = Math.floor(100000 + Math.random() * 900000);
        customer.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
        await customer.save({ validateBeforeSave: false });

        const message = `Please verify your email by this numbers: ${token}`;
        try {
            await sendEmail({
                email: customer.email,
                subject: 'Your email verification token (valid for 10 minutes)',
                message
            });

            return res.status(200).json({
                status: 'success',
                message: 'Verification email sent again. Please check your inbox.'
            });
        } catch (err) {
            console.error('Error sending email:', err.message, err.stack);
            customer.verificationToken = undefined;
            customer.verificationTokenExpires = undefined;
            await customer.save({ validateBeforeSave: false });

            return next(
                new AppError('There was an error sending the email. Try again later!'),
                500
            );
        }
    }
    const newCustomer = await Customer.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    newCustomer.verificationToken = Math.floor(100000 + Math.random() * 900000);
    newCustomer.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    await newCustomer.save({ validateBeforeSave: false })
    console.log(newCustomer.verificationToken);

    const message = `Please verify your email by this numbers: ${newCustomer.verificationToken}`;
    try {
        await sendEmail({
            email: newCustomer.email,
            subject: 'Your email verification token (valid for 10 minutes)',
            message
        });
        res.status(201).json({
            status: 'success',
            message: 'Verification email sent. Please check your inbox.'
        });
    } catch (err) {
        console.error('Error sending email:', err.message, err.stack);
        newCustomer.verificationToken = undefined;
        newCustomer.verificationTokenExpires = undefined;
        await newCustomer.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});


exports.verifyEmail = catchAsync(async (req, res, next) => {

    const customer = await Customer.findOne({
        verificationToken: req.body.token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!customer) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    customer.verificationToken = undefined;
    customer.verificationTokenExpires = undefined;
    customer.emailVerified = true;
    await customer.save({ validateBeforeSave: false });


    createSendToken(customer, 200, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const customer = await Customer.findOne({ email }).select('+password');

    if (!customer || !(await customer.correctPassword(password, customer.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }


    // 3) Check if the email has been verified
    if (!customer.emailVerified) {
        return next(new AppError('Your email has not been verified. Please verify your email to log in.', 403));
    }

    // 3) If everything ok, send token to client
    createSendToken(customer, 200, res);
});



exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await Customer.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `https://petopia-psi.vercel.app/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        console.error('Error sending email:', err.message, err.stack);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await Customer.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});



exports.logout = catchAsync(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.tokenInvalidationTime = Date.now();
    await user.save({ validateBeforeSave: false });

    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success',
        message: 'You have been logged out!'
    });
});




exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await Customer.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});