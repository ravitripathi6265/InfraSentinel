const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const initializeDB = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      projectCode TEXT,
      projectName TEXT,
      ministry TEXT,
      sector TEXT,
      state TEXT,
      implementingAgency TEXT,
      originalCost REAL,
      revisedCost REAL,
      expenditure REAL,
      originalEndDate TEXT,
      revisedEndDate TEXT,
      plannedProgress REAL,
      actualProgress REAL,
      milestonesDelayed INTEGER,
      projectStatus TEXT,
      riskScore REAL,
      costRisk REAL,
      timeRisk REAL,
      executionRisk REAL,
      externalRisk REAL,
      riskTrend TEXT,
      riskDrivers TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      source TEXT,
      date TEXT,
      category TEXT,
      location TEXT,
      sector TEXT,
      relevanceScore REAL,
      impactLevel TEXT,
      affectedProjects TEXT,
      explanation TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      email TEXT,
      role TEXT
    )`);

    // Ensure columns exist on already created tables
    db.run(`ALTER TABLE users ADD COLUMN name TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN email TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN role TEXT`, () => {});
  });
};

initializeDB();

module.exports = db;
