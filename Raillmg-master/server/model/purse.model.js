const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const purseSchema = new Schema({
  _id: { type: mongoose.Types.ObjectId, auto: true },
  block_type: { type: String, required: true },
  section: { type: String, required: true },
  km: { type: Number, required: true },
  dmd_duration: { type: Number },
  rolling_stock: { type: String },
  crew: { type: Number },
  resources: { type: Number },
  machine: { type: String },
  output: { type: Number },
  cautionTimeLoss: { type: Number }
}, {
  versionKey: false
});

const Purse = mongoose.model('Purse', purseSchema);
module.exports = Purse;
