const express = require('express');
const adoptionFormController = require('./../controllers/adoptionFormController');
const authController = require('./../controllers/authController');
const router = express.Router();

// Routes for CRUD operations
router.use(authController.protect);

router
    .route('/adoption')
    .get(adoptionFormController.getAllAdoptionForms)
    .post(adoptionFormController.createAdoptionForm);
router
    .route('/adoption/:id')
    .get(adoptionFormController.getAdoptionForm)
    .patch(adoptionFormController.updateAdoptionForm)
    .delete(adoptionFormController.deleteAdoptionForm);

module.exports = router;
