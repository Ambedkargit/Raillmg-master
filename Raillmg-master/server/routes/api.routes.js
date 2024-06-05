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

const { saveMachineAndPurseData,updateMachineAndPurse } = require('../controller/machinePurse.controller');
const MachinePurse = require('../model/machinePurse');


const router = express.Router();

router.post('/machine-purse', saveMachineAndPurseData);

// New GET route
router.get('/machine-purse', async (req, res) => {
    try {
      const machinePurses = await MachinePurse.find();
      res.json(machinePurses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

router.use('/users', usersRouter)
router.use('/machineRolls', machineRoll)
router.use('/machineNonRolls', machineNonRoll)
router.use('/maintenanceRolls', maintenanceRoll)
router.use('/maintenanceNonRolls', maintenanceNonRoll)
router.use('/railDetails', railDetails)
router.use('/machines', machines)
router.use('/boards', boards)
router.use('/stations', stations)
router.put('/machine-purse/:id', updateMachineAndPurse);
module.exports = router;