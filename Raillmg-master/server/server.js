const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/blockmodule', { useNewUrlParser: true, useUnifiedTopology: true });

const DataSchema = new mongoose.Schema({}, { strict: false });
const DataModel = mongoose.model('Data', DataSchema);

app.post('/save-to-mongodb', (req, res) => {
  const data = new DataModel(req.body);
  data.save()
    .then(() => res.status(200).send('Data saved successfully'))
    .catch(err => res.status(500).send('Error saving data: ' + err));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
