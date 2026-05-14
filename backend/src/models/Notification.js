const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentRequest' },
  message: { type: String, required: true },
  type: { type: String, enum: ['approval', 'rejection', 'status_update'], required: true },
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
