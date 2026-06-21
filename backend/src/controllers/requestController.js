const InvestmentRequest = require('../models/InvestmentRequest');
const ApprovalLog = require('../models/ApprovalLog');
const { sendNotification } = require('../services/kafka/producer');
const { evaluateRisk } = require('../services/riskEngine');
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/mock-external';

// ─── Helper: Fetch with Retry + Exponential Backoff ───
const fetchWithRetry = async (url, data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(`${API_BASE}${url}`, data, { timeout: 10000 });
      return response;
    } catch (error) {
      console.warn(`[Retry] Attempt ${i + 1}/${retries} failed for ${url}: ${error.message}`);
      if (i === retries - 1) {
        console.error(`[Retry] All attempts exhausted for ${url}`);
        return { data: { valid: false, cleared: false, error: `Service unavailable: ${url}` } };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// ─── GET /api/requests — All requests ───
exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await InvestmentRequest.find().sort({ submittedAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/requests/pending — Pending approvals ───
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const requests = await InvestmentRequest.find({ 
      status: { $in: ['pending', 'escalated'] } 
    }).sort({ submittedAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/requests/:id — Single request detail ───
exports.getRequestById = async (req, res, next) => {
  try {
    const request = await InvestmentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/requests — Create new investment request ───
exports.createRequest = async (req, res, next) => {
  const { investorName, investorEmail, companyName, investmentAmount, description, nationalId, taxId } = req.body;

  try {
    console.log('[Workflow] Starting parallel verification with retry logic...');
    
    // 1. Parallel Verification with Retry (simulates jBPM parallel gateway)
    const [idResponse, taxResponse] = await Promise.all([
      fetchWithRetry('/verify-id', { nationalId }),
      fetchWithRetry('/verify-tax', { taxId })
    ]);

    const verifications = {
      nationalId: idResponse.data.valid || false,
      taxClearance: taxResponse.data.cleared || false
    };

    console.log('[Workflow] Verification complete:', verifications);

    // 2. Risk Evaluation (simulates jBPM business rule task / DMN)
    const { riskScore, riskLevel } = evaluateRisk(investmentAmount, verifications);
    console.log(`[Workflow] Risk evaluated — Score: ${riskScore}, Level: ${riskLevel}`);

    // 3. Set SLA deadline (48 hours from submission)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 48);

    const newRequest = new InvestmentRequest({
      investorName,
      investorEmail,
      companyName,
      investmentAmount,
      description,
      nationalId,
      taxId,
      status: 'pending',
      verifications,
      riskScore,
      riskLevel,
      slaDeadline,
    });

    const savedRequest = await newRequest.save();
    console.log(`[Workflow] Request ${savedRequest._id} saved successfully`);
    res.status(201).json(savedRequest);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/requests/approve/:id — Approve request ───
exports.approveRequest = async (req, res, next) => {
  const { id } = req.params;
  const { officialId, comments } = req.body;

  try {
    const request = await InvestmentRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 1. Approve the request
    request.status = 'approved';
    request.updatedAt = Date.now();

    // 2. Register the company (simulates jBPM service task)
    try {
      const regResponse = await fetchWithRetry('/register-company', {
        companyName: request.companyName,
        ownerName: request.investorName
      });
      if (regResponse.data.success) {
        request.registrationNumber = regResponse.data.registrationNumber;
        request.status = 'registered';
        console.log(`[Workflow] Company registered: ${regResponse.data.registrationNumber}`);
      }
    } catch (regError) {
      console.warn('[Workflow] Company registration failed, proceeding with approval:', regError.message);
    }

    await request.save();

    // 3. Log approval
    const log = new ApprovalLog({
      requestId: id,
      officialId: officialId || 'official-demo',
      action: 'approve',
      comments,
      riskLevelAtTime: request.riskLevel,
    });
    await log.save();

    // 4. Kafka Notification
    await sendNotification('notifications', {
      userId: request.investorId,
      email: request.investorEmail,
      companyName: request.companyName,
      requestId: request._id,
      status: request.status,
      message: `Congratulations! Your investment request for "${request.companyName}" has been approved.${request.registrationNumber ? ` Registration Number: ${request.registrationNumber}` : ''}`
    });

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/requests/reject/:id — Reject request ───
exports.rejectRequest = async (req, res, next) => {
  const { id } = req.params;
  const { officialId, comments } = req.body;

  try {
    const request = await InvestmentRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.updatedAt = Date.now();
    await request.save();

    // Log rejection
    const log = new ApprovalLog({
      requestId: id,
      officialId: officialId || 'official-demo',
      action: 'reject',
      comments,
      riskLevelAtTime: request.riskLevel,
    });
    await log.save();

    // Kafka Notification
    await sendNotification('notifications', {
      userId: request.investorId,
      email: request.investorEmail,
      companyName: request.companyName,
      requestId: request._id,
      status: 'rejected',
      message: `We regret to inform you that your investment request for "${request.companyName}" has been rejected. Reason: ${comments || 'No reason provided.'}`
    });

    res.json({ message: 'Request rejected successfully', request });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/requests/escalate/:id — Escalate request ───
exports.escalateRequest = async (req, res, next) => {
  const { id } = req.params;
  const { officialId, reason } = req.body;

  try {
    const request = await InvestmentRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'escalated';
    request.escalated = true;
    request.escalationReason = reason || 'SLA deadline exceeded or high-risk evaluation';
    request.updatedAt = Date.now();
    await request.save();

    // Log escalation
    const log = new ApprovalLog({
      requestId: id,
      officialId: officialId || 'official-demo',
      action: 'escalate',
      comments: reason,
      riskLevelAtTime: request.riskLevel,
    });
    await log.save();

    // Kafka Notification
    await sendNotification('notifications', {
      userId: request.investorId,
      email: request.investorEmail,
      companyName: request.companyName,
      requestId: request._id,
      status: 'escalated',
      message: `Your investment request for "${request.companyName}" has been escalated for senior review. Reason: ${reason || 'Requires additional evaluation.'}`
    });

    res.json({ message: 'Request escalated successfully', request });
  } catch (error) {
    next(error);
  }
};
