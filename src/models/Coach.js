const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
});

module.exports = mongoose.model('Coach', CoachSchema);
