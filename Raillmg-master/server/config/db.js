const mongoose = require("mongoose")

const mongoUrl = process.env.MONGODB_URL

mongoose.connect(mongoUrl)

mongoose.connection.on("connected", () => {
    console.log("mongoose connected");
})
mongoose.connection.on("error", (err) => {
    console.log("mongoose Error", err);
})