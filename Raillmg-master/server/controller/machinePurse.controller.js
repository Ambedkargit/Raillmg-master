const MachinePurse = require('../model/machinePurse');

// Save machine and purse data
async function saveMachineAndPurseData(req, res) {
  try {
    const machineAndPurseList = req.body;
    if (!Array.isArray(machineAndPurseList) || !machineAndPurseList.length) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const savedData = [];

    for (const item of machineAndPurseList) {
      if (!item.machine || !item.purse) {
        return res.status(400).json({ message: 'Machine and purse are required' });
      }

      // Check if an entry with the same machine and purse exists
      const existingEntry = await MachinePurse.findOne({ machine: item.machine, purse: item.purse });

      // If the entry doesn't exist, save it
      if (!existingEntry) {
        const newPurseData = new MachinePurse({
          machine: item.machine,
          purse: item.purse,
        });
        const savedItem = await newPurseData.save();
        savedData.push(savedItem.toObject()); // Convert to plain JavaScript object
      }
    }

    console.log('All data saved successfully:', savedData);
    res.status(201).json(savedData);
  } catch (error) {
    console.error('Error saving data:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update machine and purse data
async function updateMachineAndPurse(req, res) {
  try {
    const id = req.params.id;
    const updatedPurse = req.body.purse;

    if (!updatedPurse) {
      return res.status(400).json({ message: 'Purse is required' });
    }

    const updatedEntry = await MachinePurse.findByIdAndUpdate(id, { purse: updatedPurse }, { new: true });
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    console.log('Item updated successfully:', updatedEntry);
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating item:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { saveMachineAndPurseData, updateMachineAndPurse };
