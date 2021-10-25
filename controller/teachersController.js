const gradeInfo = require('../db').db().collection('gradeInfo')
const Teacher = require('../model/Teacher')

exports.register = function(req, res){
    let teacher = new Teacher(req.body)
    teacher.register().then((result) => {
        if(teacher.errors.length){
        console.log('from register controller if resolves',teacher.errors, result)
        req.flash('errors', teacher.errors)
        req.session.save(function(){
            res.redirect('/')
        })
        
    }
    }).catch((errors) => {
        
            console.log('from register controller if rejects', errors)
     
            req.session.user = {favColor: 'blue', registerName: teacher.data.registerName, registerEmail: teacher.data.registerEmail, teacherID: teacher.data._id, loginAs: 'teacher'}
            console.log(req.session.user)
            req.session.save(function(){
                res.redirect('/')
            })
        }
    )
    
    
}

exports.login = function(req, res){
    console.log('from controller login: ', req.body)
    let teacher = new Teacher(req.body)
    teacher.login()
    .then(function(result){
        // setting up sessions
        console.log('result after executing teacher.login() function:',result)
        req.session.user = {favColor: 'blue', registerEmail: result.registerEmail, teacherID: result._id, registerName: result.registerName, loginAs: 'teacher'}
        console.log(req.session.user)
        // even though in the upper line, while updating the session object, its also sends the data to mongodb and then redirects, as accessing db is async process we need to manually save the data to db so that we can set its next process of redirect as it is done.
        req.session.save(function(){
            console.log('userController.login: redirecting to homepage after saving session:   ')
            res.redirect('/')  
        })
        // sending response with persistant session data
        })
        .catch(function(err){
            req.flash('errors', err)
            // req.session.flash.errors = [err]
            // the flash package will make a new object in session named 'flash', inside there will be a new property named 'errors' that we made above, in there, will be an array where err from function response will pushed onto. which we can leverage it later.
            // as flash creates a new object inside session and session is inside db, so flash has to interact with db as well, and its an async request and takes time, so here its manually saved with a callback of redirect to homepage after saving to db.
            req.session.save(function(){
                res.redirect('/')
            })
            })
}

exports.logOut = function(req, res){
    req.session.destroy(function(){
        res.redirect('/')
       
    })
}


exports.home = function(req, res){
       
    let teacher = new Teacher(req.body)
    
    if(req.session.user && req.session.user.loginAs == 'teacher'){
            let teacher = new Teacher(req.session.user)
            teacher.fetchAssignedCourses().then(
                (courses) => {
                    res.render('teacherDashboard', {registerName: req.session.user.registerName, AssignedCourses: courses, from: 'teacherDashboard'})
                }
            ).catch( 
                (errors) => {
                    console.log(`Cannot search the courses for teacher: ${req.session.user.registerName}.`)
                }
            )
            
        } else {
            res.render('teacherGuest', {errors: req.flash('errors'), from: 'teacherGuest'})
            // we could've wrote req.session.user.flash.errors to access the flash data but we want to access it and delete it as soon as we access it, that's why the flash method is used in the errors: req.flash('errors') instead of accessing the session.
        }
}

exports.gradingSystem = function(req, res){

        let teacher = new Teacher(req.params)
        teacher.showCourseGrades().then(
            (grade) => {
                res.render('singleCourseTeacher', {course_code: req.params.course_code, grade: grade, from: 'teacherDashboard'})
            }
        )
        .catch(
            (error) =>{
                console.log(error)
            }
        )

    }




exports.gradingSystemEdit = function(req, res){
    let teacher = new Teacher(req.params)
    teacher.showCourseGrades().then(
        (grade) => {
            res.render('singleCourseTeacherEdit', {course_code: req.params.course_code, grade: grade, from: 'teacherDashboard'})
        }
    )
    .catch(
        (error) =>{
            console.log(error)
        }
    )

}
// ['1','2','3']
exports.gradeSubmitTemp = function (req, res){
    let course_code = req.body.Coursecode[1]
    let formDataArray = req.body 
    let formDataObject = []
    for( i = 0; i < formDataArray.ID_Number.length; i++ ){
            let total = (Number(formDataArray.Attendance[i]) + Number(formDataArray.ClassTest[i]) + Number(formDataArray.Mid[i]) + Number(formDataArray.FinalA[i]) + Number(formDataArray.FinalB[i]))

            let marks = ((100*Number(total))/150)

            let letterGrade
            let gradePoint

            if (marks >= 80) {
                letterGrade = 'A+';
                gradePoint = 4.00;
            }
            else {
                if (marks >= 75 && marks <= 79) {
                    letterGrade = 'A';
                    gradePoint = 3.75
                }
                else {
                    if (marks >= 70 && marks <= 74) {
                        letterGrade = 'A-';
                        gradePoint = 3.50
                    }
                    else {
                        if (marks >= 65 && marks <= 69) {
                            letterGrade = 'B+';
                            gradePoint = 3.25
                        }
                        else {
                            if (marks >= 60 && marks <= 64) {
                                letterGrade = 'B';
                                gradePoint = 3.00
                            } else{
                                if (marks >= 55 && marks <= 59) {
                                    letterGrade = 'B-';
                                    gradePoint = 2.75
                                } else{
                                    if (marks >= 50 && marks <= 54) {
                                        letterGrade = 'C+';
                                        gradePoint = 2.50
                                    } else{
                                        if (marks >= 45 && marks <= 49) {
                                            letterGrade = 'C';
                                            gradePoint = 2.25
                                        } else{
                                            if (marks >= 40 && marks <= 44) {
                                                letterGrade = 'D';
                                                gradePoint = 2.00
                                            } else{
                                                if (marks < 40) {
                                                    letterGrade = 'F';
                                                    gradePoint = 0.00
                                                } else{
                                                    
                                                }
                                            }
                                        }
                                    }

                                }

                            }
                        }
                    }
                }
            }

         attendance1 = {
            ID_Number: formDataArray.ID_Number[i], 
            Attendance: formDataArray.Attendance[i], 
            ClassTest: formDataArray.ClassTest[i],
            Mid: formDataArray.Mid[i],
            FinalA: formDataArray.FinalA[i],
            FinalB: formDataArray.FinalB[i],
            Coursecode: formDataArray.Coursecode[i],
            Total: total,
            Marks: marks,
            LetterGrade: letterGrade,
            GradePoint: gradePoint,
            Coursecode: course_code
            }
        formDataObject.push(attendance1)
    }

    gradeInfo.deleteMany({Coursecode: course_code}).then(
        (s) => {
            gradeInfo.insertMany(formDataObject).then(
                (ss) => {
                    console.log( req.body,'<-- from gradeSubmitTemp ' )
                    res.redirect(`/courses/grading/edit/${req.params.course_code}`)
                }
            )

        }
    )





}
