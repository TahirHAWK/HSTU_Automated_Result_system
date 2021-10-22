const express = require('express')
const router = express.Router()
const teachersController = require('./controller/teachersController')
const adminController = require('./controller/adminController')

// teacher related routes
router.get('/', teachersController.home)
router.post('/teacherRegister', teachersController.register)
router.post('/teacherLogin', teachersController.login)
router.get('/teacherLogout', teachersController.logOut)


// admin related routes
router.get('/adminHome', adminController.home)
router.post('/adminRegister', adminController.register)
router.post('/adminLogin', adminController.login)
router.get('/adminLogOut', adminController.logOut)
module.exports = router
