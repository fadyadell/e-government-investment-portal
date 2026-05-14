const mongoose = require('mongoose');

const InvestmentRequestSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  investmentAmount: { type: Number, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'verification_in_progress', 'risk_evaluation', 'approved', 'rejected', 'registered'], 
    default: 'pending' 
  },
  verifications: {
    nationalId: { type: Boolean, default: false },
    taxClearance: { type: Boolean, default: false }
  },
  riskScore: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InvestmentRequest', InvestmentRequestSchema);
