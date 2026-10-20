const mongoose = require('mongoose');

// Vercel has no persistent disk, so product images are stored in MongoDB
module.exports = mongoose.model(
  'Image',
  new mongoose.Schema({ data: { type: Buffer, required: true }, contentType: String }, { timestamps: true })
);
