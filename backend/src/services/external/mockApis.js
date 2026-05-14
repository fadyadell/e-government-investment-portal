const express = require('express');
const router = express.Router();

// Mock National ID Verification
router.post('/verify-id', (req, res) => {
  const { nationalId } = req.body;
  console.log(`Mock: Verifying National ID ${nationalId}...`);
  // Simulate logic
  const isValid = nationalId && nationalId.length === 14; 
  res.json({ valid: isValid, message: isValid ? 'ID Verified' : 'Invalid ID format' });
});

// Mock Tax Clearance Verification
router.post('/verify-tax', (req, res) => {
  const { taxId } = req.body;
  console.log(`Mock: Verifying Tax Clearance for ${taxId}...`);
  res.json({ cleared: true, message: 'Tax Clearance Approved' });
});

// Mock Company Registration Service
router.post('/register-company', (req, res) => {
  const { companyName, ownerId } = req.body;
  console.log(`Mock: Registering company ${companyName}...`);
  res.json({ 
    success: true, 
    registrationNumber: `REG-${Math.floor(Math.random() * 1000000)}`,
    message: 'Company officially registered' 
  });
});

module.exports = router;
