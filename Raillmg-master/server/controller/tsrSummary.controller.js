const TsrSummary = require('../tsrSummary.model.js');

exports.saveData = async (req, res) => {
  try {
    const data = req.body;
    const savedData = await TsrSummary.insertMany(data);
    res.status(201).json(savedData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};