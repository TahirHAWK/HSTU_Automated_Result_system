const express = require('express')
const router = express.Router()
const teachersController = require('./controller/teachersController')
const adminController = require('./controller/adminController')
const studentsController = require('./controller/studentsController')

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
router.get('/admin/courses/:id',adminController.isVisitorOwner,  adminController.assignTeacher)
router.get('/admin/courses/:id/:assignedTeacher/:assignedTeacherID', adminController.isVisitorOwner, adminController.assignConfirm)

// student related routes
router.get('/studentHome', studentsController.home)
router.post('/studentRegister', studentsController.register)
router.post('/studentLogin', studentsController.login)
router.get('/studentLogOut', studentsController.logOut)

module.exports = router
