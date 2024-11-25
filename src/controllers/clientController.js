const Client = require('../models/Client');
const Coach = require('../models/Coach');

const createClient = async (req, res) => {
    try {
        const { name, email, phone, age, goal, coachId } = req.body;

        // Validate the coach ID if provided
        if (coachId) {
            const coach = await Coach.findById(coachId);
            if (!coach) {
                return res.status(404).json({ error: 'Coach not found' });
            }

            // Ensure a coach can only assign clients to themselves
            if (req.user.role === 'coach' && coach._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'You can only assign clients to yourself' });
            }
        }

        const client = new Client({
            name,
            email,
            phone,
            age,
            goal,
            coachId: coachId || req.user._id, 
        });
        await client.save();

        res.status(201).json({ message: 'Client created successfully', client });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getClientsForCoach = async (req, res) => {
    try {
        const { coachId } = req.params;

        // Validate coach ID
        if (req.user.role === 'coach' && coachId !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only view your own clients' });
        }

        const clients = await Client.find({ coachId }).populate('coachId', 'name email');

        res.status(200).json({ clients });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateClientProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progressNotes, lastUpdated, weight, bmi } = req.body;

        // Find the client and check ownership
        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        if (req.user.role === 'coach' && client.coachId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only update your own clients' });
        }

        client.progressNotes = progressNotes || client.progressNotes;
        client.lastUpdated = lastUpdated || new Date();
        client.weight = weight || client.weight;
        client.bmi = bmi || client.bmi;
        await client.save();

        res.status(200).json({ message: 'Client progress updated successfully', client });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        await client.deleteOne();

        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createClient,
    getClientsForCoach,
    updateClientProgress,
    deleteClient,
};
