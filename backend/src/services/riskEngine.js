/**
 * Risk Evaluation Engine
 * Calculates risk score and level based on investment amount and verification results.
 * In a real jBPM deployment, this would be a DMN decision table.
 */

const evaluateRisk = (investmentAmount, verifications = {}) => {
  let riskScore = 0;

  // Base risk from investment amount
  if (investmentAmount < 100000) {
    riskScore = Math.floor(Math.random() * 15) + 10; // 10-24
  } else if (investmentAmount < 500000) {
    riskScore = Math.floor(Math.random() * 15) + 30; // 30-44
  } else if (investmentAmount < 2000000) {
    riskScore = Math.floor(Math.random() * 15) + 55; // 55-69
  } else {
    riskScore = Math.floor(Math.random() * 15) + 80; // 80-94
  }

  // Verification failures increase risk
  if (!verifications.nationalId) riskScore = Math.min(100, riskScore + 15);
  if (!verifications.taxClearance) riskScore = Math.min(100, riskScore + 10);

  // Determine risk level
  let riskLevel;
  if (riskScore <= 25) riskLevel = 'low';
  else if (riskScore <= 50) riskLevel = 'medium';
  else if (riskScore <= 75) riskLevel = 'high';
  else riskLevel = 'critical';

  return { riskScore, riskLevel };
};

module.exports = { evaluateRisk };
