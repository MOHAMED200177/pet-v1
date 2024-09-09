const express = require('express');
const petController = require('./../controllers/petController');
const authController = require('./../controllers/authController');
const upload = require('./../utils/multer');
const router = express.Router();

router
    .route('/')
    .get(petController.getAllPets)
    .post(authController.protect,
        upload.array('imageUrl', 3),
        petController.createPet); // Apply the upload middleware



router.use(authController.protect);




router
    .route('/:id')
    .get(petController.getPet)
    .patch(petController.updatePet)
    .delete(petController.deletePet);

module.exports = router;
