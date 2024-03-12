const express = require("express")
const machines = require("../model/machines.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const docs = await machines.find();
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})
router.post('/', async (req, res) => {
    try {
        const data = req.body
        const docs = await machines.create(data);
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await machines.findByIdAndUpdate(id, data, { new: true });
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await machines.findByIdAndDelete(id, data);
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})



module.exports = router;