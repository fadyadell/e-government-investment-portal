const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'egovernment-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
  } catch (error) {
    console.error('Error connecting Kafka Producer:', error);
  }
};

const sendNotification = async (topic, message) => {
  try {
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
  }
};

module.exports = { connectProducer, sendNotification };
