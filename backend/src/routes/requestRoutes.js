const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/', requestController.getAllRequests);
router.get('/pending', requestController.getPendingApprovals);
router.get('/:id', requestController.getRequestById);
router.post('/', requestController.createRequest);
router.put('/approve/:id', requestController.approveRequest);
router.put('/reject/:id', requestController.rejectRequest);
router.put('/escalate/:id', requestController.escalateRequest);

module.exports = router;
