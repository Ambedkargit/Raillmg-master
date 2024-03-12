
const express = require("express")
const machineNonRoll = require("../model/machineNonRoll.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const docs = await machineNonRoll.find();
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const docs = await machineNonRoll.findById(req.params.id)
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const docs = await machineNonRoll.create(data)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await machineNonRoll.findByIdAndUpdate(id, data, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const docs = await machineNonRoll.findByIdAndDelete(id, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})

module.exports = router;
