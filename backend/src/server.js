require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { connectProducer } = require('./services/kafka/producer');
const { startConsumer } = require('./services/kafka/consumer');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/egov_portal';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize Kafka
  await connectProducer();
  await startConsumer().catch(err => console.error('Kafka Consumer Error:', err));
});
