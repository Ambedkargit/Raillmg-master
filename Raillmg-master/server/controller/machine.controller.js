const express = require("express");
const machines = require("../model/machines.model");
const router = express.Router();

// Get all machines
router.get('/', async (req, res) => {
    try {
        const docs = await machines.find();
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving machines", error });
    }
});

// Create a new machine
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ message: "No data provided" });
        }
        const docs = await machines.create(data);
        res.status(201).json(docs);
    } catch (error) {
        res.status(500).json({ message: "Error creating machine", error });
    }
});

// Update an existing machine
router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        if (!data) {
            return res.status(400).json({ message: "No data provided" });
        }
        const docs = await machines.findByIdAndUpdate(id, data, { new: true });
        if (!docs) {
            return res.status(404).json({ message: "Machine not found" });
        }
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: "Error updating machine", error });
    }
});

// Delete a machine
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const docs = await machines.findByIdAndDelete(id);
        if (!docs) {
            return res.status(404).json({ message: "Machine not found" });
        }
        res.status(200).json({ message: "Machine deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting machine", error });
    }
});

module.exports = router;
