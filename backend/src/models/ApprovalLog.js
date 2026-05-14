const mongoose = require('mongoose');

const ApprovalLogSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentRequest', required: true },
  officialId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['approve', 'reject'], required: true },
  comments: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ApprovalLog', ApprovalLogSchema);
