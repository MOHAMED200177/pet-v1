const AdoptionForm = require('./../modles/formModle');
const factory = require('./handlerFactory');

exports.createAdoptionForm = factory.createOne(AdoptionForm);
exports.getAllAdoptionForms = factory.getAll(AdoptionForm);
exports.getAdoptionForm = factory.getOne(AdoptionForm);
exports.updateAdoptionForm = factory.updateOne(AdoptionForm);
exports.deleteAdoptionForm = factory.deleteOne(AdoptionForm);
