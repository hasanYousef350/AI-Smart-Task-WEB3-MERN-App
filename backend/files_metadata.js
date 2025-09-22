const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  uploader: String,
  path: String, // or `url` if cloud
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);
