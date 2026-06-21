/**
 * Seed script — populates MongoDB with demo data for presentations.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const InvestmentRequest = require('./models/InvestmentRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/egov_portal';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await InvestmentRequest.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // Create demo users
    const investor = await User.create({
      name: 'Ahmed Hassan',
      email: 'ahmed@investor.com',
      phone: '+201234567890',
      role: 'investor',
      password: 'demo123',
    });

    const official = await User.create({
      name: 'Dr. Sarah Ibrahim',
      email: 'sarah@egov.gov',
      phone: '+201098765432',
      role: 'official',
      password: 'demo123',
    });

    console.log('[Seed] Created demo users');

    // Create sample investment requests at various stages
    const requests = await InvestmentRequest.insertMany([
      {
        investorId: investor._id,
        investorName: 'Ahmed Hassan',
        investorEmail: 'ahmed@investor.com',
        companyName: 'TechNova Solutions',
        investmentAmount: 1500000,
        description: 'AI-powered research facility for machine learning and data analytics',
        nationalId: '12345678901234',
        taxId: 'TAX-98765',
        status: 'pending',
        verifications: { nationalId: true, taxClearance: true },
        riskScore: 62,
        riskLevel: 'high',
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      {
        investorId: investor._id,
        investorName: 'Ahmed Hassan',
        investorEmail: 'ahmed@investor.com',
        companyName: 'Green Energy Co.',
        investmentAmount: 250000,
        description: 'Solar panel manufacturing and distribution',
        nationalId: '12345678901234',
        taxId: 'TAX-54321',
        status: 'approved',
        verifications: { nationalId: true, taxClearance: true },
        riskScore: 32,
        riskLevel: 'medium',
        registrationNumber: 'REG-DEMO-7482',
        slaDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        investorName: 'Fatima Al-Rashid',
        investorEmail: 'fatima@business.com',
        companyName: 'Digital Payments Ltd.',
        investmentAmount: 5000000,
        description: 'Fintech platform for digital payments across the MENA region',
        nationalId: '98765432109876',
        taxId: 'TAX-FINTECH-001',
        status: 'pending',
        verifications: { nationalId: true, taxClearance: true },
        riskScore: 88,
        riskLevel: 'critical',
        slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
      {
        investorName: 'Omar Khalil',
        investorEmail: 'omar@startup.io',
        companyName: 'FoodChain Logistics',
        investmentAmount: 75000,
        description: 'Smart food supply chain management system',
        nationalId: '11223344556677',
        taxId: 'TAX-FOOD-202',
        status: 'rejected',
        verifications: { nationalId: false, taxClearance: true },
        riskScore: 45,
        riskLevel: 'medium',
        slaDeadline: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
      {
        investorName: 'Layla Mahmoud',
        investorEmail: 'layla@medtech.com',
        companyName: 'MedTech Innovations',
        investmentAmount: 800000,
        description: 'Medical devices and telemedicine platform',
        nationalId: '55667788990011',
        taxId: 'TAX-MED-555',
        status: 'registered',
        verifications: { nationalId: true, taxClearance: true },
        riskScore: 58,
        riskLevel: 'high',
        registrationNumber: 'REG-MEDTECH-3901',
        slaDeadline: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
    ]);

    console.log(`[Seed] Created ${requests.length} sample investment requests`);
    console.log('\n[Seed] ✓ Database seeded successfully!');
    console.log('[Seed] Demo data summary:');
    console.log(`  • ${2} Users (1 investor, 1 official)`);
    console.log(`  • ${requests.length} Investment Requests`);
    console.log('    - 2 Pending (1 high-risk, 1 critical)');
    console.log('    - 1 Approved');
    console.log('    - 1 Rejected');
    console.log('    - 1 Registered');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedData();
