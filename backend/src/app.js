const express = require('express');
const cors = require('cors');
const requestRoutes = require('./routes/requestRoutes');
const mockApis = require('./services/external/mockApis');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/mock-external', mockApis);

app.get('/', (req, res) => {
  res.send('E-Government Investment Portal API is running...');
});

module.exports = app;
