const mongoose = require("mongoose")

const Schema = mongoose.Schema
const stationSchema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    station: { type: String, unique: true },
    mps: { type: Number, default: 0 },
}, {
    versionKey: false
})
const stations = mongoose.model("stations", stationSchema);
module.exports = stations