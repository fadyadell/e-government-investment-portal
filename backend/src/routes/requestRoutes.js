const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/', requestController.getAllRequests);
router.get('/pending', requestController.getPendingApprovals);
router.post('/', requestController.createRequest);
router.put('/approve/:id', requestController.approveRequest);
router.put('/reject/:id', requestController.rejectRequest);

module.exports = router;
