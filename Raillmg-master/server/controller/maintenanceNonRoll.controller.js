
const express = require("express")
const maintenanceNonRoll = require("../model/maintenanceNonRoll.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const docs = await maintenanceNonRoll.find();
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const docs = await maintenanceNonRoll.findById(req.params.id)
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const docs = await maintenanceNonRoll.create(data)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await maintenanceNonRoll.findByIdAndUpdate(id, data, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id
        console.log("🚀 ~ id:", id)
        const docs = await maintenanceNonRoll.findByIdAndDelete(id)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const docs = await maintenanceNonRoll.findByIdAndDelete(id, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})


module.exports = router;
