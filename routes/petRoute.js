const express = require('express');
const catController = require('./../controllers/petController');
const upload = require('./../utils/multer');
const router = express.Router();

router
    .route('/')
    .get(catController.getAllCats)
    .post(upload.array('imageUrl', 3), catController.createCat); // Apply the upload middleware

router
    .route('/:id')
    .get(catController.getCat)
    .patch(catController.updateCat)
    .delete(catController.deleteCat);

module.exports = router;
