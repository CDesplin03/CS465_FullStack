var express = require('express');
var router = express.Router();
var controller = require('../controllers/travel');

/ Get travel page /
router.get('/', controller.travel);

module.exports = router;