const express = require('express');
const router = express.Router();

// Simulate a random delay between 200-800ms to feel realistic
const simulateDelay = () => new Promise(resolve => 
  setTimeout(resolve, 200 + Math.random() * 600)
);

// ─── Mock National ID Verification (POST - backward compatible) ───
router.post('/verify-id', async (req, res) => {
  await simulateDelay();
  const { nationalId } = req.body;
  console.log(`[Mock API] Verifying National ID: ${nationalId}...`);
  const isValid = nationalId && nationalId.length === 14;
  res.json({ 
    valid: isValid, 
    message: isValid ? 'National ID verified successfully' : 'Invalid National ID format (must be 14 digits)',
    verifiedAt: new Date().toISOString(),
    source: 'National Civil Authority'
  });
});

// ─── Mock National ID Verification (GET - as per spec) ───
router.get('/verify-national-id/:id', async (req, res) => {
  await simulateDelay();
  const { id } = req.params;
  console.log(`[Mock API] GET - Verifying National ID: ${id}...`);
  const isValid = id && id.length === 14;
  res.json({ 
    valid: isValid, 
    nationalId: id,
    fullName: isValid ? 'Ahmed Mohamed Ibrahim' : null,
    message: isValid ? 'National ID verified successfully' : 'Invalid National ID format',
    verifiedAt: new Date().toISOString(),
    source: 'National Civil Authority'
  });
});

// ─── Mock Tax Clearance Verification (POST - backward compatible) ───
router.post('/verify-tax', async (req, res) => {
  await simulateDelay();
  const { taxId } = req.body;
  console.log(`[Mock API] Verifying Tax Clearance for: ${taxId}...`);
  res.json({ 
    cleared: true, 
    taxId,
    message: 'Tax clearance approved — no outstanding obligations',
    clearedAt: new Date().toISOString(),
    source: 'Tax Revenue Authority'
  });
});

// ─── Mock Tax Clearance Verification (GET - as per spec) ───
router.get('/verify-tax/:taxId', async (req, res) => {
  await simulateDelay();
  const { taxId } = req.params;
  console.log(`[Mock API] GET - Verifying Tax Clearance for: ${taxId}...`);
  res.json({ 
    cleared: true, 
    taxId,
    outstandingBalance: 0,
    message: 'Tax clearance approved — no outstanding obligations',
    clearedAt: new Date().toISOString(),
    source: 'Tax Revenue Authority'
  });
});

// ─── Mock Company Registration Service (POST) ───
router.post('/register-company', async (req, res) => {
  await simulateDelay();
  const { companyName, ownerId, ownerName } = req.body;
  console.log(`[Mock API] Registering company: ${companyName}...`);
  const registrationNumber = `REG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
  res.json({ 
    success: true, 
    registrationNumber,
    companyName,
    registeredOwner: ownerName || ownerId || 'N/A',
    registeredAt: new Date().toISOString(),
    message: 'Company officially registered with the Commercial Registry',
    source: 'Commercial Registry Authority'
  });
});

module.exports = router;
