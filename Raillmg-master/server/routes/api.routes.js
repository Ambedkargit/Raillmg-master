const usersRouter = require("../controller/user.controller")
const machineRoll = require("../controller/machineRoll.controller")
const machineNonRoll = require("../controller/machineNonRoll.controller")
const maintenanceRoll = require("../controller/maintenanceRoll.controller")
const maintenanceNonRoll = require("../controller/maintenanceNonRoll.controller")
const railDetails = require("../controller/railDetails.controller")
const machines = require("../controller/machine.controller")
const boards = require("../controller/boards.controller")
const stations = require("../controller/station.controller")
const express = require("express")

const router = express.Router()

router.use('/users', usersRouter)
router.use('/machineRolls', machineRoll)
router.use('/machineNonRolls', machineNonRoll)
router.use('/maintenanceRolls', maintenanceRoll)
router.use('/maintenanceNonRolls', maintenanceNonRoll)
router.use('/railDetails', railDetails)
router.use('/machines', machines)
router.use('/boards', boards)
router.use('/stations', stations)

module.exports = router;