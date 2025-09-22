const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  project: String,
  status: { type: String, default: 'Pending' }, // New field
  assignee: String,
  dueDate: Date,
  priority: String
});

module.exports = mongoose.model('Task', TaskSchema);
