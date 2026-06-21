const kafka = require('./kafka');

const producer = kafka.producer();
let isConnected = false;

const connectProducer = async () => {
  try {
    await producer.connect();
    isConnected = true;
    console.log('[Kafka Producer] Connected successfully');
  } catch (error) {
    console.error('[Kafka Producer] Connection error:', error.message);
    console.warn('[Kafka Producer] Will retry on next send attempt...');
  }
};

const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    isConnected = false;
    console.log('[Kafka Producer] Disconnected');
  } catch (error) {
    console.error('[Kafka Producer] Disconnect error:', error.message);
  }
};

const sendNotification = async (topic, message, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!isConnected) {
        await producer.connect();
        isConnected = true;
      }
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      console.log(`[Kafka Producer] Message sent to topic "${topic}":`, JSON.stringify(message, null, 2));
      return true;
    } catch (error) {
      console.error(`[Kafka Producer] Attempt ${attempt}/${retries} failed:`, error.message);
      isConnected = false;
      if (attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.warn(`[Kafka Producer] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('[Kafka Producer] All retry attempts exhausted. Message not sent.');
        return false;
      }
    }
  }
};

module.exports = { connectProducer, disconnectProducer, sendNotification };
