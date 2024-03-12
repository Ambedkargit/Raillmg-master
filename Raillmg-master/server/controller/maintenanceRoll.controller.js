
const express = require("express")
const maintenanceRoll = require("../model/maintenanceRoll.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const docs = await maintenanceRoll.find();
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const docs = await maintenanceRoll.findById(req.params.id)
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const docs = await maintenanceRoll.create(data)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await maintenanceRoll.findByIdAndUpdate(id, data, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const docs = await maintenanceRoll.findByIdAndDelete(id, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})

module.exports = router;
