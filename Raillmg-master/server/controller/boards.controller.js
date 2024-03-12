const express = require("express")
const boards = require("../model/boards.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const docs = await boards.find();
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})
router.post('/', async (req, res) => {
    try {
        const data = req.body
        const docs = await boards.create(data);
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await boards.findByIdAndUpdate(id, data, { new: true });
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await boards.findByIdAndDelete(id, data);
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})



module.exports = router;