const mongoose = require("mongoose")

const Schema = mongoose.Schema
const boardSchema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    board: { type: String, unique: true },
}, {
    versionKey: false
})
const boards = mongoose.model("boards", boardSchema);
module.exports = boards