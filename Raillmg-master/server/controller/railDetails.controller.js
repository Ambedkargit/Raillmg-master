
const express = require("express")
const railDetails = require("../model/railDetails.model")
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        let docs = []
        if (req.query.board) {
            docs = await railDetails.find({ board: req.query.board });
        } else {
            docs = await railDetails.find();
        }
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const docs = await railDetails.findById(req.params.id)
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const docs = await railDetails.create(data)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await railDetails.findByIdAndUpdate(id, data, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const docs = await railDetails.findByIdAndDelete(id)
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})


module.exports = router;
