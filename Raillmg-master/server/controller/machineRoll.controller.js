const express = require("express")
const MachinePurse = require('../model/machinePurse');
const machineRoll = require("../model/machineRoll.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        var machinePurses = await MachinePurse.find();
        var docs = await machineRoll.find();
        docs = docs.map(doc => {
            doc = doc.toObject(); // Convert document to a plain JavaScript object
            doc.purse = "";
            const machines = doc.machine;
            for (machineIndex in machines) {
                for (machinePurseIndex in machinePurses) {
                    if (machines[machineIndex] == machinePurses[machinePurseIndex]['machine']) {
                        doc.purse = doc.purse + machines[machineIndex]+":"+ machinePurses[machinePurseIndex]['purse'] + "; ";
                    }
                }
            } 
            return doc;
        });
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
        console.log(data);
        if (data['status'] == 'Accept') {
            const old_doc = await machineRoll.findById(id);
            const machines = old_doc['machine'];
            const machinePurses = await MachinePurse.find();
            for (machineIndex in machines) {
                for (machinePurseIndex in machinePurses) {
                    if (machines[machineIndex] == machinePurses[machinePurseIndex]['machine']) {
                        const newPurseValue = machinePurses[machinePurseIndex]['purse'] - old_doc['dmd_duration'];
                        if (newPurseValue < 0) {
                            res.status(400).json({ message: `Purse value of ${machines[machineIndex]} cannot go negative` })
                            return; 
                        }
                        const updatedEntry = await MachinePurse.findByIdAndUpdate(machinePurses[machinePurseIndex]['_id'], { purse: newPurseValue }, { new: true });
                    }
                }
            }
        }
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