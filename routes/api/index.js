// Purpose: API routes for the application.
const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/thoughts', require('./thoughts'));


module.exports = router;
