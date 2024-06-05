const express = require('express');
const Purse = require('../model/purse.model');
const router = express.Router();

// GET all purses
router.get('/', async (req, res) => {
  try {
    const docs = await Purse.find();
    res.send(docs);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch records', error });
  }
});

// CREATE a new purse
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const doc = await Purse.create(data);
    res.status(201).send(doc);
  } catch (error) {
    res.status(400).send({ message: 'Failed to create record', error });
  }
});

// UPDATE a purse by ID
router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const doc = await Purse.findByIdAndUpdate(id, data, { new: true });

    if (!doc) {
      return res.status(404).send({ message: 'Record not found' });
    }

    res.send(doc);
  } catch (error) {
    res.status(400).send({ message: 'Failed to update record', error });
  }
});

// DELETE a purse by ID
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Purse.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).send({ message: 'Record not found' });
    }

    res.send(doc);
  } catch (error) {
    res.status(400).send({ message: 'Failed to delete record', error });
  }
});

module.exports = router;
