const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const riskController = require('../controllers/riskController');
const aiController = require('../controllers/aiController');
const authController = require('../controllers/authController');

// Health Check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
router.get('/data/status', (req, res) => res.json({ source: 'Live Database', lastUpdated: 'Real-time' }));

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/signup', authController.signup);

// Projects
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.get('/projects/:id/news', projectController.getProjectNews);
router.get('/news', projectController.getAllNews);

// Risk & Analytics
router.get('/risk/overview', riskController.getRiskOverview);
router.get('/risk/top', riskController.getTopRiskyProjects);
router.get('/risk/early-warnings', riskController.getEarlyWarnings);
router.get('/analytics/sectors', riskController.getSectorAnalytics);
router.get('/analytics/ministries', riskController.getMinistryAnalytics);
router.get('/analytics/states', riskController.getStateAnalytics);

// Simulations
router.post('/simulate', riskController.simulateRisk);

// AI integrations
router.post('/chat', aiController.chat);
router.post('/executive-brief', aiController.generateExecutiveBrief);
router.post('/investigate', aiController.investigateProject);
router.post('/predict', aiController.predictProjectRisk);

module.exports = router;
