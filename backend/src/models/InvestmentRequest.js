const mongoose = require('mongoose');

const InvestmentRequestSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  investorName: { type: String, required: true },
  investorEmail: { type: String, required: true },
  companyName: { type: String, required: true },
  investmentAmount: { type: Number, required: true },
  description: { type: String },
  nationalId: { type: String },
  taxId: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'verification_in_progress', 'risk_evaluation', 'approved', 'rejected', 'registered', 'escalated'], 
    default: 'pending' 
  },
  verifications: {
    nationalId: { type: Boolean, default: false },
    taxClearance: { type: Boolean, default: false }
  },
  riskScore: { type: Number, default: 0 },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  registrationNumber: { type: String },
  escalated: { type: Boolean, default: false },
  escalationReason: { type: String },
  slaDeadline: { type: Date },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InvestmentRequest', InvestmentRequestSchema);
