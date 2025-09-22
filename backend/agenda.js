const mongoose = require('mongoose');

const AgendaSchema = new mongoose.Schema({
  title: String,
  dueDate: Date
});

module.exports = mongoose.model('Agenda', AgendaSchema);
