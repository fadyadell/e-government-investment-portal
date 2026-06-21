const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentRequest' },
  message: { type: String, required: true },
  type: { type: String, enum: ['approval', 'rejection', 'status_update', 'escalation'], required: true },
  channel: { type: String, enum: ['email', 'sms', 'in_app'], default: 'email' },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
