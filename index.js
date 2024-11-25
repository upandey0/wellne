const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const clientRoutes = require('./src/routes/clientRoutes');

require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api', clientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
