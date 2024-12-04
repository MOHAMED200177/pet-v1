const express = require('express');
const customerController = require('./../controllers/CustomerController');
const authController = require('./../controllers/authController');
const upload = require('./../utils/multer');

const router = express.Router();

router.post('/signup', upload.single('photo'), authController.signup);
router.post('/login', authController.login);
router.patch('/verify-email', authController.verifyEmail);
router.get('/logout', authController.protect, authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);






router.use(authController.protect);

router.get('/', customerController.getAllUsers);

router.get('/me', customerController.getMe, customerController.getUser);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMe', upload.single('photo'), customerController.updateMe);


router
    .route('/:id')
    .get(authController.protect, customerController.getUser)
    .delete(authController.restrictTo('admin'), customerController.deleteUser);


module.exports = router;
