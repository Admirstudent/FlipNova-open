const mongoose = require('mongoose');

const registrationCounterSchema = new mongoose.Schema({
    _id: { type: String, default: 'singleton' },  // only one document
    freeCount: { type: Number, default: 0 },
    paidCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('RegistrationCounter', registrationCounterSchema);