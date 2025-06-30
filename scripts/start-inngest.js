#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const inngestServer = spawn('bun', ['run', 'inngest/server.ts'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

inngestServer.on('close', (code) => {
  console.log(`Inngest server process exited with code ${code}`);
});

process.on('SIGTERM', () => {
  inngestServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  inngestServer.kill('SIGINT');
}); 