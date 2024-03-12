const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    // email: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    // mobile: { type: Number, required: true }
}, {
    versionKey: false
})



const users = mongoose.model("users", userSchema);
module.exports = users


