require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { connectProducer, disconnectProducer } = require('./services/kafka/producer');
const { startConsumer, stopConsumer } = require('./services/kafka/consumer');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/egov_portal';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log(`[MongoDB] Connected to ${MONGO_URI}`))
  .catch(err => console.error('[MongoDB] Connection error:', err.message));

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  E-Government Investment Portal API`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log(`${'═'.repeat(55)}\n`);
  
  // Initialize Kafka
  await connectProducer();
  await startConsumer().catch(err => {
    console.error('[Kafka Consumer] Failed to start:', err.message);
    console.warn('[Kafka Consumer] Server will continue without Kafka consumer');
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] ${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('[Server] HTTP server closed');
    
    await disconnectProducer();
    await stopConsumer();
    
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed');
    
    console.log('[Server] Shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
