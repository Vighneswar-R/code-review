const express = require('express');

const router = express.Router();

const genericControllers = require('../Controllers/genericControllers')





router.get('/fetch-all/:table',genericControllers.getData);

router.get('/create/:table',genericControllers.addData);




module.exports = router;


