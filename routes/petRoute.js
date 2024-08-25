const express = require('express');
const petController = require('./../controllers/petController');
const upload = require('./../utils/multer');
const router = express.Router();

router
    .route('/')
    .get(petController.getAllPets)
    .post(upload.array('imageUrl', 3), petController.createPet); // Apply the upload middleware

// router
//     .route('/:id')
//     .get(petController.getCat)
//     .patch(petController.updateCat)
//     .delete(petController.deleteCat);

module.exports = router;
