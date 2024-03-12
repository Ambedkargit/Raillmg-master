const express = require("express")
const path = require('path')

const APP_DIR = '../dist/client/browser'

// console.log(path.join(__dirname, APP_DIR))

const app = express()
app.use(express.json({ limit: "1mb" }));
app.use(express.json())

app.get('*.*', express.static(path.join(__dirname, APP_DIR)));
app.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, APP_DIR, 'index.html'))
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log("server started at http://localhost:" + PORT);
})