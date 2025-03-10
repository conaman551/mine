const express = require("express");
const router = express.Router();
const filtersController = require('../controllers/filterController');

router.post('/', filtersController.createFilter);

router.get('/:id', filtersController.getFilterById);

router.get('/user/:uid', filtersController.getFiltersByUserId);

router.put('/:id', filtersController.updateFilterById);

router.delete('/:id', filtersController.deleteFilterById);

module.exports = router;