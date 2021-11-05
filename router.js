const express = require('express')
const router = express.Router()
const teachersController = require('./controller/teachersController')
const adminController = require('./controller/adminController')
const studentsController = require('./controller/studentsController')
const testController = require('./controller/testController')

// teacher related routes
router.get('/', teachersController.home)
router.post('/teacherRegister', teachersController.register)
router.post('/teacherLogin', teachersController.login)
router.get('/teacherLogout', teachersController.logOut)
router.get('/courses/grading/:course_code/:credit', teachersController.gradingSystem)
router.post('/courses/grading/:course_code/:credit', teachersController.gradeSubmitTemp)
router.post('/marksPDF', teachersController.printAsPdf)
router.get('/courses/grading/edit/:course_code/:credit', teachersController.gradingSystemEdit)
router.get('/courses/grading/finalSubmit/:course_code/:credit', teachersController.finalSubmit)


 
// admin related routes
router.get('/adminHome', adminController.home)
router.post('/adminRegister', adminController.register)
router.post('/adminLogin', adminController.login)
router.get('/adminLogOut', adminController.logOut)
router.get('/admin/courses/:id', adminController.isVisitorOwner,  adminController.assignTeacher)
router.get('/admin/courses/:id/:assignedTeacher/:assignedTeacherID', adminController.isVisitorOwner, adminController.assignConfirm)
router.get('/admin/courses/:course_code/unsubmit', adminController.unsubmit)
router.get('/admin/result', adminController.resultAllSemester)
router.get('/admin/result/:Levelsemester', adminController.showSingleResult)


// student related routes
router.get('/studentHome', studentsController.home)
router.post('/studentRegister', studentsController.register)
router.post('/studentLogin', studentsController.login)
router.get('/studentLogOut', studentsController.logOut)
router.get('/student/result/:Levelsemester', studentsController.showSingleResult)

// sample data conversion route
router.get('/convertCourseCreditNumber', teachersController.convertCourseCreditNumber)
router.get('/test/arrays', testController.arrays)





module.exports = router
