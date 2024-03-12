const express = require("express")
const users = require("../model/user.model")
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        // res.send(await users.find())
        // return
        const login = req.query
        const docs = await users.findOne(login);
        if (docs == null) {
            res.status(404).send({ message: "user not found" })
        } else {
            delete docs.password
            res.send(docs)
        }

    } catch (error) {
        res.send(error)
    }
})

router.get('/allUsers/', async (req, res) => {
    try {
        const docs = await users.find().select('+password')
        res.send(docs)

    } catch (error) {
        res.send(error)
    }
})

// router.get('/:id', async (req, res) => {
//     try {
//         const docs = await users.findById(req.params.id)
//         res.send(docs)
//     } catch (error) {
//         res.send(error)
//     }
// })

router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const docs = await users.create(data)
        delete docs.password
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.patch("/:id", async (req, res) => {
    try {
        const data = req.body;
        const id = req.params.id;
        const docs = await users.findByIdAndUpdate(id, data, { new: true })
        delete docs.password
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const docs = await users.findByIdAndDelete(id, { new: true })
        res.send(docs)
    } catch (err) {
        res.send(err)
    }
})


module.exports = router;