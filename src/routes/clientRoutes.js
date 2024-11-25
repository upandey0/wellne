const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../services/roleMiddleware');
const clientController = require('../controllers/clientController');

router.post(
    '/clients',
    authMiddleware,
    roleMiddleware(['admin', 'coach']),
    clientController.createClient
);

router.get(
    '/coaches/:coachId/clients',
    authMiddleware,
    roleMiddleware(['admin', 'coach']),
    clientController.getClientsForCoach
);

router.patch(
    '/clients/:id/progress',
    authMiddleware,
    roleMiddleware(['coach']),
    clientController.updateClientProgress
);

router.delete(
    '/clients/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    clientController.deleteClient
);

router.post(
    '/clients/:id/schedule',
    authMiddleware,
    roleMiddleware(['admin', 'coach']),
    async (req, res) => {
        try {
            const sessionDetails = req.body; // { date, time, sessionType }
            const clientId = req.params.id;

            const client = await scheduleSession(clientId, sessionDetails);

            res.status(200).json({
                message: 'Session scheduled successfully',
                client: client,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
