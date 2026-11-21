// Generates the browser-side Firebase configuration from environment variables.
// Browser config is PUBLIC after deployment; never put private credentials here.
const fs = require('fs');
const path = require('path');

function readDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
readDotEnv(path.resolve(__dirname, '..', '.env'));

const list = (name) => (process.env[name] || '').split(',').map(v => v.trim()).filter(Boolean);
const cfg = {
  PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  API_KEY: process.env.FIREBASE_API_KEY || '',
  STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  ADMIN_UIDS: list('ORBIT_ADMIN_UIDS'),
  ADMIN_EMAILS: list('ORBIT_ADMIN_EMAILS'),
  DEFAULT_CREDIT: Number(process.env.ORBIT_DEFAULT_CREDIT || 0),
  MAX_CREDIT: Number(process.env.ORBIT_MAX_CREDIT || 1000),
  STORE_PAGE_SIZE: Number(process.env.ORBIT_STORE_PAGE_SIZE || 8),
  ADMIN_PAGE_SIZE: Number(process.env.ORBIT_ADMIN_PAGE_SIZE || 8),
  EMAILJS: {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
  }
};
if (!cfg.PROJECT_ID || !cfg.API_KEY || !cfg.STORAGE_BUCKET) {
  console.error('Missing required config. Set FIREBASE_PROJECT_ID, FIREBASE_API_KEY, and FIREBASE_STORAGE_BUCKET in .env or environment.');
  process.exit(1);
}
cfg.FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${cfg.PROJECT_ID}/databases/(default)/documents`;
const output = `// Generated file. Do not edit or commit. Browser configuration is public.\nconst CONFIG = ${JSON.stringify(cfg, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '..', 'js', 'config.js'), output);
console.log('Generated js/config.js');
