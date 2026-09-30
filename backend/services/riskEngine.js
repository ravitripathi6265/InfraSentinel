/**
 * Transparent Deterministic Risk Engine
 * Calculates indicative risk scores (0-100) based on project data.
 */

function calculateRisk(projectData) {
  const {
    originalCost = 0,
    revisedCost = 0,
    expenditure = 0,
    originalEndDate,
    revisedEndDate,
    plannedProgress = 0,
    actualProgress = 0,
    milestonesDelayed = 0,
    externalRiskInput = 0 // from news intelligence
  } = projectData;

  // 1. Cost Risk (0-100)
  let costEscalationRatio = 0;
  if (originalCost > 0) {
    costEscalationRatio = (revisedCost - originalCost) / originalCost;
  }
  let costRisk = Math.min(100, Math.max(0, costEscalationRatio * 200)); // 50% escalation = 100 risk

  // 2. Time Risk (0-100)
  let timeRisk = 0;
  if (originalEndDate && revisedEndDate) {
    const origDate = new Date(originalEndDate);
    const revDate = new Date(revisedEndDate);
    if (revDate > origDate) {
      const delayMonths = (revDate - origDate) / (1000 * 60 * 60 * 24 * 30);
      timeRisk = Math.min(100, Math.max(0, delayMonths * 5)); // 20 months delay = 100 risk
    }
  }

  // 3. Execution Risk (0-100)
  // Progress Gap
  let progressGap = plannedProgress - actualProgress;
  let executionRiskProgress = Math.min(100, Math.max(0, progressGap * 3)); // 33% gap = 100 risk
  
  // Expenditure vs Progress mismatch
  let expenditureRatio = revisedCost > 0 ? (expenditure / revisedCost) * 100 : 0;
  let mismatch = expenditureRatio - actualProgress;
  let executionRiskMismatch = Math.min(100, Math.max(0, mismatch * 2));

  // Milestone delays (each adds 15 to risk)
  let executionRiskMilestones = Math.min(100, milestonesDelayed * 15);

  let executionRisk = (executionRiskProgress * 0.5) + (executionRiskMismatch * 0.3) + (executionRiskMilestones * 0.2);

  // 4. External Risk (0-100)
  let externalRisk = externalRiskInput;

  // OVERALL RISK CALCULATION
  const weights = {
    cost: 0.25,
    time: 0.25,
    execution: 0.35,
    external: 0.15
  };

  const overallRisk = Math.round(
    (costRisk * weights.cost) +
    (timeRisk * weights.time) +
    (executionRisk * weights.execution) +
    (externalRisk * weights.external)
  );

  // Determine Risk Level
  let riskLevel = 'LOW';
  if (overallRisk >= 75) riskLevel = 'CRITICAL';
  else if (overallRisk >= 50) riskLevel = 'HIGH';
  else if (overallRisk >= 25) riskLevel = 'MODERATE';

  // Determine risk drivers
  let drivers = [];
  if (progressGap > 10) drivers.push(`Physical progress is ${Math.round(progressGap)}% behind plan.`);
  if (costEscalationRatio > 0.1) drivers.push(`Revised cost increased by ${Math.round(costEscalationRatio * 100)}%.`);
  if (timeRisk > 30) drivers.push('Significant schedule slippage detected.');
  if (milestonesDelayed > 0) drivers.push(`${milestonesDelayed} major milestone(s) delayed.`);
  if (externalRisk > 50) drivers.push('Relevant external/supply-chain risk detected.');

  return {
    overallRisk: Math.round(overallRisk),
    riskLevel,
    components: {
      costRisk: Math.round(costRisk),
      timeRisk: Math.round(timeRisk),
      executionRisk: Math.round(executionRisk),
      externalRisk: Math.round(externalRisk)
    },
    drivers
  };
}

module.exports = {
  calculateRisk
};
