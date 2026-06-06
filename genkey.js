import fs from 'fs';
const key = fs.readFileSync('.env', 'utf8')
  .split('\n')
  .find(l => l.startsWith('FIREBASE_PRIVATE_KEY='))
  ?.replace('FIREBASE_PRIVATE_KEY=', '')
  .replace(/^"|"$/g, '')
  .replace(/\\n/g, '\n');

console.log(Buffer.from(key).toString('base64'));