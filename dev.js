const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SI Ignite / Project Sentinel (Backend + Frontend)...\n');

// Start backend
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n🛑 Stopping servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
