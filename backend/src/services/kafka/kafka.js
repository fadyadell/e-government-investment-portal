const { Kafka, logLevel } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'egovernment-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

module.exports = kafka;
