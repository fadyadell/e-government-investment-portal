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

// Helper function with Retry Logic
const fetchWithRetry = async (url, data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Mocking actual Axios call to our internal mock APIs
      const response = await axios.post(`http://localhost:5000/api/mock-external${url}`, data);
      return response;
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}. Retrying...`);
      if (i === retries - 1) throw new Error(`Service unavailable: ${url}`);
      // Wait before retrying (exponential backoff mock)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Create new investment request
exports.createRequest = async (req, res) => {
  const { investorId, companyName, investmentAmount, description, nationalId, taxId } = req.body;

  try {
    console.log('Starting parallel verification with retry logic...');
    
    // 1. Parallel Verification with Retry
    const [idResponse, taxResponse] = await Promise.all([
      fetchWithRetry('/verify-id', { nationalId }).catch(e => ({ data: { valid: false, error: e.message } })),
      fetchWithRetry('/verify-tax', { taxId }).catch(e => ({ data: { cleared: false, error: e.message } }))
    ]);

    const newRequest = new InvestmentRequest({
      investorId,
      companyName,
      investmentAmount,
      description,
      status: 'pending',
      verifications: {
        nationalId: idResponse.data.valid || false,
        taxClearance: taxResponse.data.cleared || false
      }
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Critical workflow failure:', error);
    res.status(500).json({ message: 'Workflow initialization failed. Please try again later.' });
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
