const db = require('./data/database');
const fs = require('fs');
const path = require('path');
const { calculateRisk } = require('./services/riskEngine');

const projectsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'seedProjects.json'), 'utf8'));
const newsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'seedNews.json'), 'utf8'));

db.serialize(() => {
  // Clear existing project and news data for a fresh authentic seed
  db.run(`DELETE FROM news`);
  db.run(`DELETE FROM projects`);

  // Insert News
  const stmtNews = db.prepare(`INSERT INTO news (title, source, date, category, location, sector, relevanceScore, impactLevel, affectedProjects, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  newsData.forEach(n => {
    stmtNews.run(n.title, n.source, n.date, n.category, n.location, n.sector, n.relevanceScore, n.impactLevel, n.affectedProjects, n.explanation);
  });
  stmtNews.finalize();

  // Insert 12 Real Projects with Calculated Risk Engine Metrics
  const stmtProj = db.prepare(`INSERT INTO projects (id, projectCode, projectName, ministry, sector, state, implementingAgency, originalCost, revisedCost, expenditure, originalEndDate, revisedEndDate, plannedProgress, actualProgress, milestonesDelayed, projectStatus, riskScore, costRisk, timeRisk, executionRisk, externalRisk, riskTrend, riskDrivers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  projectsData.forEach(p => {
    // Check if affected by news
    const affectedByNews = newsData.filter(n => n.affectedProjects.includes(p.id));
    const externalRiskInput = affectedByNews.length > 0 ? 75 : 15;

    const riskData = calculateRisk({
      ...p,
      externalRiskInput
    });

    // Determine realistic risk trend
    let riskTrend = 'Stable';
    if (riskData.overallRisk >= 75) riskTrend = 'Deteriorating';
    else if (p.actualProgress >= 90) riskTrend = 'Improving';

    stmtProj.run(
      p.id, p.projectCode, p.projectName, p.ministry, p.sector, p.state, p.implementingAgency,
      p.originalCost, p.revisedCost, p.expenditure, p.originalEndDate, p.revisedEndDate,
      p.plannedProgress, p.actualProgress, p.milestonesDelayed, p.projectStatus,
      riskData.overallRisk, riskData.components.costRisk, riskData.components.timeRisk,
      riskData.components.executionRisk, riskData.components.externalRisk,
      riskTrend,
      JSON.stringify(riskData.drivers)
    );
  });
  stmtProj.finalize();

  // Ensure default accounts exist with proper metadata
  const stmtUser = db.prepare(`INSERT OR IGNORE INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)`);
  stmtUser.run('admin', 'password', 'System Administrator', 'admin@sentinel.gov.in', 'Chief Monitoring Officer');
  stmtUser.run('tipathiravi205@gmail.com', 'ravi@6265', 'Ravi Tripathi', 'tipathiravi205@gmail.com', 'Project Director');
  stmtUser.finalize();
  
  console.log(`Database seeded successfully with ${projectsData.length} authentic Central Sector projects and ${newsData.length} intelligence news items.`);
});
