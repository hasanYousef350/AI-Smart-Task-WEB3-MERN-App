const mongoose = require('mongoose');
// Define the invitation schema
const invitationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create the Invitation model
const Invitation = mongoose.model('Invitation', invitationSchema);

// Export Invitation model (if using a separate file)
module.exports = Invitation;
