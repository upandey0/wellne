const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    goal: { type: String, required: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    scheduledSessions: [
        {
            date: { type: Date, required: true },
            time: { type: String, required: true },
            sessionType: { type: String, required: true },
        },
    ],
});

module.exports = mongoose.model('Client', ClientSchema);
