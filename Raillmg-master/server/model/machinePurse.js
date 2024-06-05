const mongoose = require('mongoose');

const machinePurseSchema = new mongoose.Schema({
  machine: { type: String, required: true },
  purse: { type: String, required: true },
}, { });

// Add a unique compound index on machine and purse
machinePurseSchema.index({ machine: 1, purse: 1 }, { unique: true });

const MachinePurse = mongoose.model('MachinePurse', machinePurseSchema);

module.exports = MachinePurse;