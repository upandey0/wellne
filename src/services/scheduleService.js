const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Client = require('../models/Client');
const Coach = require('../models/Coach');
const { sendEmail } = require('./emailService');

// Function to schedule a session for a client
const scheduleSession = async (clientId, sessionDetails) => {
    try {
        const client = await Client.findById(clientId);
        if (!client) {
            throw new Error('Client not found');
        }

        client.scheduledSessions.push(sessionDetails);
        await client.save();

        cron.schedule(`0 0 0 ${sessionDetails.date} * *`, async () => {
            await sendReminderEmail(client.email, sessionDetails);
        });

        return client;
    } catch (err) {
        throw new Error(err.message);
    }
};

const sendReminderEmail = async (email, sessionDetails) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Follow-up Session Reminder',
        text: `You have a scheduled ${sessionDetails.sessionType} session on ${sessionDetails.date} at ${sessionDetails.time}.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent to ${email}`);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

module.exports = { scheduleSession };
