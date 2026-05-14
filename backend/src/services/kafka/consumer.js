const { Kafka } = require('kafkajs');
const { sendEmail } = require('../email/emailService');
const Notification = require('../../models/Notification');

const kafka = new Kafka({
  clientId: 'egovernment-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: true });

  console.log('Kafka Consumer connected and subscribed to "notifications"');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value.toString());
      console.log('Received notification payload:', payload);

      const { userId, email, requestId, type, status, message: text } = payload;

      // 1. Save to MongoDB
      try {
        const newNotification = new Notification({
          userId,
          requestId,
          message: text,
          type: type || 'status_update',
        });
        await newNotification.save();
        console.log('Notification saved to MongoDB');
      } catch (err) {
        console.error('Error saving notification to DB:', err);
      }

      // 2. Send Email
      const subject = `Investment Request ${status.toUpperCase()}`;
      const htmlContent = `
        <h3>Hello,</h3>
        <p>Your investment request for <strong>${payload.companyName || 'your company'}</strong> has been <strong>${status}</strong>.</p>
        <p>Details: ${text}</p>
        <br/>
        <p>Best regards,<br/>E-Government Investment Portal Team</p>
      `;

      await sendEmail(email, subject, text, htmlContent);
    },
  });
};

module.exports = { startConsumer };
