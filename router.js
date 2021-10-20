const express = require('express')
const router = express.Router()
const teachersController = require('./controller/teachersController')


router.get('/', teachersController.home)
router.post('/teacherRegister', teachersController.register)
router.post('/teacherLogin', teachersController.login)

module.exports = router
