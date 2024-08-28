const express = require('express');
const customerController = require('./../controllers/CustomerController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/verify-email', authController.verifyEmail);


router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, customerController.updateMe);
router.delete('/deleteMe', authController.protect, customerController.deleteUser);

router.get('/', authController.protect, customerController.getAllUsers);

router
    .route('/:id')
    .delete(authController.restrictTo('admin'), customerController.deleteUser);

module.exports = router;
