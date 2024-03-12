const express = require("express")
const stations = require("../model/stations.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const stationList = req.query.stations.split(',')
        const docs = await stations.find({ station: { $in: stationList } });
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.post('/', async (req, res) => {
    try {
        const data = req.body
        const docs = await stations.create(data);
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await stations.findByIdAndUpdate(id, data, { new: true });
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body;
        const docs = await stations.findByIdAndDelete(id, data);
        res.send(docs)
    } catch (error) {
        res.send(error)
    }
})



module.exports = router;