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
router.get('/courses/grading/:course_code', teachersController.gradingSystem)
router.post('/courses/grading/:course_code', teachersController.gradeSubmitTemp)
router.get('/courses/grading/edit/:course_code', teachersController.gradingSystemEdit)
router.get('/courses/grading/finalSubmit/:course_code', teachersController.finalSubmit)


 
// admin related routes
router.get('/adminHome', adminController.home)
router.post('/adminRegister', adminController.register)
router.post('/adminLogin', adminController.login)
router.get('/adminLogOut', adminController.logOut)
router.get('/admin/courses/:id', adminController.isVisitorOwner,  adminController.assignTeacher)
router.get('/admin/courses/:id/:assignedTeacher/:assignedTeacherID', adminController.isVisitorOwner, adminController.assignConfirm)
router.get('/admin/result', adminController.resultAllSemester)
router.get('/admin/result/:levelSemester', adminController.showSingleResult)


// student related routes
router.get('/studentHome', studentsController.home)
router.post('/studentRegister', studentsController.register)
router.post('/studentLogin', studentsController.login)
router.get('/studentLogOut', studentsController.logOut)


// sample data conversion route
router.get('/convertCourseCreditNumber', teachersController.convertCourseCreditNumber)




module.exports = router
