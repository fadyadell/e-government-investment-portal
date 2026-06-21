const mongoose = require('mongoose');

const ApprovalLogSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentRequest', required: true },
  officialId: { type: String, required: true },
  action: { type: String, enum: ['approve', 'reject', 'escalate'], required: true },
  comments: { type: String },
  riskLevelAtTime: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ApprovalLog', ApprovalLogSchema);
