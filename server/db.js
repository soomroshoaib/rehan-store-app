const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

async function startBuiltIn() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const dbPath = path.join(__dirname, 'data');
  fs.mkdirSync(dbPath, { recursive: true });
  console.log('Starting built-in database (the first run takes a while because a file is downloaded)...');
  const mem = await MongoMemoryServer.create({
    instance: { dbPath, port: 27018, storageEngine: 'wiredTiger' },
  });
  console.log('Built-in database ready. Data is saved in the server/data folder.');
  return mem.getUri('rehan-store');
}

// If MONGO_URI is set it is tried first (Atlas / local MongoDB).
// If it is empty or cannot connect (e.g. Atlas IP whitelist issue) the built-in database is used,
// so the server does not crash and the site keeps running.
async function connectDB() {
  const isProd = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
  const uri = (process.env.MONGO_URI || '').trim();

  if (uri && !uri.includes('<')) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log('MongoDB (Atlas/URI) connected');
      return;
    } catch (e) {
      if (isProd) throw e;
      console.warn('\n[WARNING] Could not connect using MONGO_URI:', e.message);
      console.warn('[WARNING] In Atlas go to Network Access > Add IP Address > "Allow access from anywhere".');
      console.warn('[WARNING] Using the built-in database for now (your Atlas data will not be used).\n');
      await mongoose.disconnect().catch(() => {});
    }
  }

  if (isProd) throw new Error('MONGO_URI is not set (add it in Vercel Environment Variables)');
  await mongoose.connect(await startBuiltIn());
  console.log('MongoDB (built-in) connected');
}

module.exports = connectDB;
