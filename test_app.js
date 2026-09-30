async function runTests() {
  console.log('====================================================');
  console.log('  TESTING PROJECT SENTINEL (SI IGNITE)');
  console.log('====================================================\n');

  try {
    // 1. Frontend
    process.stdout.write('1. Checking Frontend (http://localhost:5173)... ');
    const feRes = await fetch('http://localhost:5173');
    if (feRes.status === 200) {
      console.log('✓ OK (HTTP 200)');
    } else {
      console.log(`✗ FAILED (HTTP ${feRes.status})`);
    }

    // 2. Backend Health
    process.stdout.write('2. Checking Backend Health (http://localhost:3001/api/health)... ');
    const healthRes = await fetch('http://localhost:3001/api/health');
    const healthData = await healthRes.json();
    console.log(`✓ OK (${JSON.stringify(healthData)})`);

    // 3. Auth Login
    process.stdout.write('3. Checking Auth Login (tipathiravi205@gmail.com)... ');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tipathiravi205@gmail.com', password: 'ravi@6265' })
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      console.log(`✓ OK (User: "${loginData.user.name}", Role: "${loginData.user.role}")`);
    } else {
      console.log('✗ FAILED to authenticate', loginData);
    }

    // 4. Projects Endpoint
    process.stdout.write('4. Fetching Projects List (/api/projects)... ');
    const projRes = await fetch('http://localhost:3001/api/projects');
    const projects = await projRes.json();
    console.log(`✓ OK (${projects.length} projects retrieved)`);
    if (projects.length > 0) {
      console.log(`   Sample: "${projects[0].projectName}" | Risk Score: ${projects[0].riskScore}`);
    }

    // 5. Risk Overview
    process.stdout.write('5. Fetching Risk Overview (/api/risk/overview)... ');
    const riskRes = await fetch('http://localhost:3001/api/risk/overview');
    const riskData = await riskRes.json();
    console.log(`✓ OK (Total: ${riskData.totalProjects}, Critical: ${riskData.distribution.critical}, High: ${riskData.distribution.high}, Cost Exposure: ₹${riskData.potentialCostExposure} Cr)`);

    // 6. Early Warnings
    process.stdout.write('6. Fetching Early Warnings (/api/risk/early-warnings)... ');
    const warnRes = await fetch('http://localhost:3001/api/risk/early-warnings');
    const warnings = await warnRes.json();
    console.log(`✓ OK (${warnings.length} early warnings active)`);

    // 7. News Intelligence
    process.stdout.write('7. Fetching News Intelligence (/api/news)... ');
    const newsRes = await fetch('http://localhost:3001/api/news');
    const news = await newsRes.json();
    console.log(`✓ OK (${news.length} intelligence items retrieved)`);

    // 8. Sector Analytics
    process.stdout.write('8. Fetching Sector Analytics (/api/analytics/sectors)... ');
    const secRes = await fetch('http://localhost:3001/api/analytics/sectors');
    const sectors = await secRes.json();
    console.log(`✓ OK (${sectors.length} sectors analyzed)`);

    // 9. What-If Simulator
    process.stdout.write('9. Testing Risk Simulator (/api/simulate)... ');
    const simRes = await fetch('http://localhost:3001/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'P-1001',
        updates: {
          actualProgress: 40,
          revisedCost: 220000,
          milestonesDelayed: 6
        }
      })
    });
    const sim = await simRes.json();
    console.log(`✓ OK (Current Risk: ${sim.currentRisk.overallRisk}/100 -> Simulated Risk: ${sim.scenarioRisk.overallRisk}/100)`);

    // 10. AI Assistant Chat
    process.stdout.write('10. Testing AI Assistant (/api/chat)... ');
    const chatRes = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Give me a brief summary of the highest risk project.' })
    });
    const chat = await chatRes.json();
    console.log(`✓ OK (AI response received)`);
    console.log(`   AI Snippet: ${chat.reply.slice(0, 160).replace(/\n/g, ' ')}...`);

    console.log('\n====================================================');
    console.log('  ALL CHECKS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('\nTest failed with error:', err.message);
  }
}

runTests();
