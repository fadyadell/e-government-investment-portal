const kafka = require('./kafka');
const { sendEmail } = require('../email/emailService');
const Notification = require('../../models/Notification');

const consumer = kafka.consumer({ groupId: 'notification-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: false });

  console.log('[Kafka Consumer] Connected and subscribed to "notifications" topic');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let payload;
      try {
        payload = JSON.parse(message.value.toString());
        console.log('[Kafka Consumer] Received notification payload:', JSON.stringify(payload, null, 2));
      } catch (parseError) {
        console.error('[Kafka Consumer] Failed to parse message:', parseError.message);
        return;
      }

      const { userId, email, requestId, companyName, status, message: text } = payload;

      // Determine notification type from status
      let notificationType = 'status_update';
      if (status === 'approved' || status === 'registered') notificationType = 'approval';
      else if (status === 'rejected') notificationType = 'rejection';
      else if (status === 'escalated') notificationType = 'escalation';

      // 1. Save notification to MongoDB
      let notificationStatus = 'pending';
      try {
        const newNotification = new Notification({
          userId: userId || undefined,
          requestId: requestId || undefined,
          message: text,
          type: notificationType,
          channel: 'email',
          status: 'pending',
        });
        await newNotification.save();
        console.log('[Kafka Consumer] Notification record saved to MongoDB');
      } catch (dbError) {
        console.error('[Kafka Consumer] Error saving notification to DB:', dbError.message);
      }

      // 2. Send Email
      if (email) {
        const subject = `Investment Request — ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px;">E-Government Investment Portal</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Investment Request Notification</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #f8fafc; margin-bottom: 16px;">Request ${status.toUpperCase()}</h2>
              <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px;"><strong style="color: #94a3b8;">Company:</strong> <span style="color: #f8fafc;">${companyName || 'N/A'}</span></p>
                <p style="margin: 0 0 12px;"><strong style="color: #94a3b8;">Status:</strong> <span style="color: ${status === 'approved' || status === 'registered' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b'}; font-weight: 600;">${status.toUpperCase()}</span></p>
                <p style="margin: 0;"><strong style="color: #94a3b8;">Details:</strong> <span style="color: #cbd5e1;">${text}</span></p>
              </div>
              <p style="color: #64748b; font-size: 13px;">This is an automated notification from the E-Government Investment Portal. Please do not reply to this email.</p>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 16px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: #475569; font-size: 12px;">© 2026 E-Government Investment Portal. All rights reserved.</p>
            </div>
          </div>
        `;

        try {
          const emailResult = await sendEmail(email, subject, text, htmlContent);
          notificationStatus = emailResult ? 'sent' : 'failed';
          console.log(`[Kafka Consumer] Email ${notificationStatus} to ${email}`);
        } catch (emailError) {
          notificationStatus = 'failed';
          console.error('[Kafka Consumer] Email sending failed:', emailError.message);
        }

        // Update notification status in DB
        try {
          await Notification.findOneAndUpdate(
            { requestId, type: notificationType },
            { status: notificationStatus },
            { sort: { sentAt: -1 } }
          );
        } catch (updateError) {
          console.error('[Kafka Consumer] Failed to update notification status:', updateError.message);
        }
      }
    },
  });
};

const stopConsumer = async () => {
  try {
    await consumer.disconnect();
    console.log('[Kafka Consumer] Disconnected');
  } catch (error) {
    console.error('[Kafka Consumer] Disconnect error:', error.message);
  }
};

module.exports = { startConsumer, stopConsumer };
