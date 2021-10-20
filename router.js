const express = require('express')
const router = express.Router()
const teachersController = require('./controller/teachersController')


router.get('/', teachersController.home)
router.post('/teacherRegister', teachersController.register)

module.exports = router
