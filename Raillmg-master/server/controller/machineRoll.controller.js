
const express = require("express")
const machineRoll = require("../model/machineRoll.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const docs = await machineRoll.find();
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const docs = await machineRoll.findById(req.params.id)
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const docs = await machineRoll.create(data)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await machineRoll.findByIdAndUpdate(id, data, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const docs = await machineRoll.findByIdAndDelete(id, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})

module.exports = router;
