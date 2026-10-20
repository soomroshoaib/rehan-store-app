require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const seedData = require('./seedData');

(async () => {
  await connectDB();
  await seedData();
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
