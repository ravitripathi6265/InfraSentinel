const db = require('../data/database');
const { calculateRisk } = require('../services/riskEngine');

exports.getRiskOverview = (req, res) => {
  db.all('SELECT riskScore, originalCost, revisedCost FROM projects', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let critical = 0, high = 0, moderate = 0, low = 0;
    let costExposure = 0;

    rows.forEach(r => {
      if (r.riskScore >= 75) critical++;
      else if (r.riskScore >= 50) high++;
      else if (r.riskScore >= 25) moderate++;
      else low++;
      
      costExposure += (r.revisedCost - r.originalCost);
    });

    res.json({
      totalProjects: rows.length,
      distribution: { critical, high, moderate, low },
      potentialCostExposure: costExposure
    });
  });
};

exports.getTopRiskyProjects = (req, res) => {
  db.all('SELECT * FROM projects ORDER BY riskScore DESC LIMIT 10', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => ({
      ...row,
      riskDrivers: JSON.parse(row.riskDrivers)
    })));
  });
};

exports.getEarlyWarnings = (req, res) => {
  db.all('SELECT id, projectCode, projectName, riskScore, riskDrivers FROM projects WHERE riskScore >= 50 ORDER BY riskScore DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const warnings = rows.map(r => {
      const drivers = JSON.parse(r.riskDrivers);
      return {
        id: r.id,
        projectCode: r.projectCode,
        projectName: r.projectName,
        severity: r.riskScore >= 75 ? 'CRITICAL' : 'HIGH',
        evidence: drivers.join(' '),
        date: new Date().toISOString().split('T')[0],
        action: 'Review immediate recovery plan.'
      };
    });
    res.json(warnings);
  });
};

exports.getSectorAnalytics = (req, res) => {
  db.all('SELECT sector, AVG(riskScore) as avgRisk, COUNT(*) as count FROM projects GROUP BY sector', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getMinistryAnalytics = (req, res) => {
  db.all('SELECT ministry, AVG(riskScore) as avgRisk, COUNT(*) as count FROM projects GROUP BY ministry', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getStateAnalytics = (req, res) => {
  db.all('SELECT state, AVG(riskScore) as avgRisk, COUNT(*) as count FROM projects GROUP BY state', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.simulateRisk = (req, res) => {
  const { id, updates } = req.body;
  const rawId = (id || '').trim();
  const numericId = !isNaN(rawId) && rawId !== '' ? Number(rawId) : -1;

  db.get('SELECT * FROM projects WHERE UPPER(id) = UPPER(?) OR UPPER(projectCode) = UPPER(?) OR rowid = ? OR id LIKE ?', 
    [rawId, rawId, numericId, `%${rawId}%`], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Project not found' });
    
    // Simulate
    const simulatedData = { ...row, ...updates };
    const simulatedRisk = calculateRisk(simulatedData);

    res.json({
      currentRisk: {
        overallRisk: row.riskScore,
        costRisk: row.costRisk,
        timeRisk: row.timeRisk,
        executionRisk: row.executionRisk,
        externalRisk: row.externalRisk
      },
      scenarioRisk: simulatedRisk
    });
  });
};
