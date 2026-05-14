const InvestmentRequest = require('../models/InvestmentRequest');
const ApprovalLog = require('../models/ApprovalLog');
const { sendNotification } = require('../services/kafka/producer');
const axios = require('axios');

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await InvestmentRequest.find().populate('investorId', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    const requests = await InvestmentRequest.find({ status: 'pending' }).populate('investorId', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new investment request
exports.createRequest = async (req, res) => {
  const { investorId, companyName, investmentAmount, description, nationalId, taxId } = req.body;

  try {
    // 1. Parallel Verification (Mock)
    console.log('Starting parallel verification...');
    // In a real scenario, these would be async calls to external services
    const idVerification = { data: { valid: true } }; // Mocked
    const taxVerification = { data: { cleared: true } }; // Mocked

    const newRequest = new InvestmentRequest({
      investorId,
      companyName,
      investmentAmount,
      description,
      status: 'pending',
      verifications: {
        nationalId: idVerification.data.valid,
        taxClearance: taxVerification.data.cleared
      }
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve request
exports.approveRequest = async (req, res) => {
  const { id } = req.params;
  const { officialId, comments } = req.body;

  try {
    const request = await InvestmentRequest.findById(id).populate('investorId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'approved';
    request.updatedAt = Date.now();
    await request.save();

    // Log approval
    const log = new ApprovalLog({
      requestId: id,
      officialId,
      action: 'approve',
      comments
    });
    await log.save();

    // Kafka Notification
    await sendNotification('notifications', {
      userId: request.investorId._id,
      email: request.investorId.email,
      companyName: request.companyName,
      requestId: request._id,
      status: 'approved',
      message: `Congratulations! Your investment request for ${request.companyName} has been approved.`
    });

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { officialId, comments } = req.body;

  try {
    const request = await InvestmentRequest.findById(id).populate('investorId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.updatedAt = Date.now();
    await request.save();

    // Log rejection
    const log = new ApprovalLog({
      requestId: id,
      officialId,
      action: 'reject',
      comments
    });
    await log.save();

    // Kafka Notification
    await sendNotification('notifications', {
      userId: request.investorId._id,
      email: request.investorId.email,
      companyName: request.companyName,
      requestId: request._id,
      status: 'rejected',
      message: `We regret to inform you that your investment request for ${request.companyName} has been rejected. Reason: ${comments}`
    });

    res.json({ message: 'Request rejected successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
