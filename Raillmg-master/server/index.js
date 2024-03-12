require("dotenv").config();
const express = require("express")
const cors = require("cors");
var morgan = require('morgan')

const apiRoutes = require("./routes/api.routes");
const path = require('path')

require("./config/db")
const APP_DIR = '../client/dist/client/browser'

const app = express()
app.use(morgan('tiny'))
app.use(express.json({ limit: "1mb" }));
app.use(express.json())
app.use(cors())

app.use('/api', apiRoutes);

app.get('*.*', express.static(path.join(__dirname, APP_DIR)));
app.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, APP_DIR, 'index.html'))
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("server started at http://localhost:" + PORT);
})