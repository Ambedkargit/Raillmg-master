const mongoose = require("mongoose")

const Schema = mongoose.Schema
const machineSchema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    machine: { type: String, unique: true },
}, {
    versionKey: false
})
const machines = mongoose.model("machines", machineSchema);
module.exports = machines