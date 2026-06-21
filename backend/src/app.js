const express = require('express');
const cors = require('cors');
const requestRoutes = require('./routes/requestRoutes');
const mockApis = require('./services/external/mockApis');
const { errorHandler, requestLogger } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/mock-external', mockApis);

app.get('/', (req, res) => {
  res.json({
    name: 'E-Government Investment Portal API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      requests: '/api/requests',
      pending: '/api/requests/pending',
      mockApis: '/api/mock-external',
    }
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
