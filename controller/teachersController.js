const courseInfo = require('../db').db().collection('courseInfo')
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
var _ = require('lodash');
var fs = require('fs');
const Teacher = require('../model/Teacher')

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
                    res.render('teacherDashboard', {registerName: req.session.user.registerName, AssignedCourses: courses, from: 'teacherDashboard', style: ''})
                }
            ).catch( 
                (errors) => {
                    console.log(`Cannot search the courses for teacher: ${req.session.user.registerName}.`)
                }
            )
            
        } else {
            res.render('teacherGuest', {errors: req.flash('errors'), from: 'teacherGuest',  style: ''})
            // we could've wrote req.session.user.flash.errors to access the flash data but we want to access it and delete it as soon as we access it, that's why the flash method is used in the errors: req.flash('errors') instead of accessing the session.
        }
}

exports.gradingSystem = function(req, res){

        let teacher = new Teacher(req.session.user)
        teacher.fetchAssignedCourses().then(
            (courses) =>{
                let fetchedCourses = courses;
                teacher = new Teacher(req.params)
                teacher.showCourseGrades().then(
                    (grade) => {
                        // console.log(grade, '--> from grading system function controller ')
                        let totalMarks 
                        res.render('singleCourseTeacher', {course_code: req.params.course_code, grade: grade, coursesData: fetchedCourses, totalMarks, from: 'teacherDashboard', style: 'singleCourseTeacher'})
                    }
                )

            }
        )
        .catch(
            (error) =>{
                console.log(error)
            }
        )

    }




exports.gradingSystemEdit = function(req, res){

    let teacher = new Teacher(req.session.user)
    teacher.fetchAssignedCourses().then(
        (courses) =>{ 
            let fetchedCourses = courses;
            teacher = new Teacher(req.params)
            teacher.showCourseGrades().then(
                (grade) => {
                    let totalMarks
                    res.render('singleCourseTeacherEdit', {course_code: req.params.course_code, grade: grade, coursesData: fetchedCourses,totalMarks, from: 'teacherDashboard', style: ''})
                }
            )

        }
    )
    .catch(
        (error) =>{
            console.log(error)
        }
    )


}


exports.gradeSubmitTemp = function(req, res){
    console.log(req.body, req.params, "--> from gradeSubmitTemp")
    let teacher = new Teacher(req.body)
    teacher.convertDataForDB(req.params.credit).then(
        (result) => {
            console.log(result, '<<from after convertDataForDB<<')
            teacher.submitTeacherGrade(result).then(
                (result) => {
                    // console.log( req.body,'<-- from gradeSubmitTemp ' )
                    res.redirect(`/courses/grading/edit/${req.params.course_code}/${req.params.credit}`)
                }
            ).catch(
                (error) => {
                    console.log('cannot submit from gradeSubmitTemp:')
                }
            )
        }
    ).catch(
        (error) => {
            console.log('cannot submit data from gradeSubmitTemp: ', error)
        }
    )

}

exports.finalSubmit = function(req, res){
    console.log("final submit just pressed,", req.params)
    let teacher = new Teacher(req.params)
    teacher.finalSubmit().then(
        (result) => {
            console.log('final submit resolved', result)
            res.redirect(`/courses/grading/${req.params.course_code}/${req.params.credit}`)
        }
    ).catch(
        (error) => {
            console.log('cannot connect to db or change in finalSubmit.', error)
        }
    )
}

exports.convertCourseCreditNumber = function(req, res) {
    courseInfo.find({}).toArray().then(
        (courses) => {
            let courseCreditNumber = []
            courses.forEach((course) => {
                let capitalizeLevelSemester = course.Levelsemester
                 capitalizeLevelSemester = capitalizeLevelSemester.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()); 
                course = {
                    _id: course._id,
                    degree: course.degree,
                    Levelsemester: capitalizeLevelSemester,
                    course_code: course.course_code,
                    course_title: course.course_title,
                    credit: Number(course.credit),
                    assignedTeacher: course.assignedTeacher,
                    assignedTeacherID: course.assignedTeacherID,
                    finalSubmission: course.finalSubmission,
                    assignedDepartment: course.assignedDepartment
                }
                courseCreditNumber.push(course)
            })
           courseInfo.deleteMany({}).then(
               (result) => {
                   courseInfo.insertMany(courseCreditNumber).then(
                       (result) =>{
                           console.log(result, 'replaced old course code strings with numbers.')
                       }
                   )
               }
           )
            
        }
    )
}



exports.printAsPdf = function(req, res, next){ 
    console.log(req.body, '--> from printAsPdf')
    let teacherName = req.body.teacherName;
    let courseTitle = req.body.courseTitle;
    let course_code = req.body.course_code;
    let creditHour = req.body.creditHour;
    let fullMarks = req.body.fullMarks;
    // array starts from here
    let ID_Number = req.body.ID_Number;
    let Attendance = req.body.Attendance;
    let ClassTest = req.body.ClassTest;
    let Mid = req.body.Mid;
    let FinalA = req.body.FinalA;
    let FinalB = req.body.FinalB;
    let Total = req.body.Total;
    let Marks = req.body.Marks;
    let LetterGrade = req.body.LetterGrade;
    let GradePoint = req.body.GradePoint;
    let allMarks =[[ { text: 'Student ID', style: 'header' }, { text: 'Attendance', style: 'header' }, { text: 'Class Test', style: 'header' }, { text: 'Mid', style: 'header' },{ text: 'Final (Section A)', style: 'header' }, { text: 'Final (Section B)', style: 'header' }, { text: 'Total', style: 'header' }, { text: 'Marks(%)', style: 'header' },{ text: 'Letter Grade', style: 'header' }, { text: 'Grade Point ' , style: 'header' }]]


    let allDetails = [ { text: 'Teacher Name: ', style: 'header' }, teacherName, { text: 'Course Title: ', style: 'header' }, courseTitle, { text:  'Course Code: ', style: 'header' }, course_code, { text:  'Credits: ', style: 'header' },  creditHour, { text:  'Total: ', style: 'header' }, fullMarks]

    if(ID_Number){
        for(i=0; i< ID_Number.length; i++){
            let markSingle = [ ID_Number[i], Attendance[i], ClassTest[i], Mid[i], FinalA[i], FinalB[i], Total[i], Marks[i], LetterGrade[i], GradePoint[i]]
            allMarks.push(markSingle)
        }

    } else{
        allMarks.push(["List is empty", "Contact Enrollment section for more details", "", "", "", "", "", "", "", ""])
    }

    // ID_Number, Attendance, ClassTest, Mid, FinalA, FinalB, Total, Marks, LetterGrade, GradePoint
    // `Course Title: ${courseTitle}`, `Assigned Teacher: ${teacherName}`, `Credit: ${creditHour}`,
console.log(allMarks,ID_Number, '--> for test')

    var documentDefinition = {
        pageOrientation: 'landscape',
        pageMargins: [ 40, 60, 40, 60 ],
        content: [
            {text: 'Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur - 5200',
            alignment: 'center', fontSize: 20},
            '\n\n', '\n\n',
            'Course Details: ',
            '\n\n',
            {
                table: {

          
                  body: [allDetails]
                  
                 }
              },  
              '\n\n', 'Grade Details: ',
              '\n\n',
            {
                table: {
                    body: allMarks
                }
            }, 
            '\n\n','\n\n', '\n\n',
            {
                columns: [
                    {
                        text: 'Signature of the Member of the Examination Committee \n Date: ___________________________'
                    },
                    {
                        text: 'Signature of the Scrutinizer \n Date: ___________________________'
                    },
                    {
                        text: 'Signature of the Chairman of Department \n Date: ___________________________'
                    }
                ]
            }
            
        ], 
        styles: {
            header: {
                bold: true,
                color: 'blue',
                margin: [ 5, 2, 10, 20 ]
            }

        }
      };

    const pdfDoc = pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data)=>{
        res.writeHead(200, 
        {
            'Content-Type': 'application/pdf',
            'Content-Disposition':`attachment;filename="${teacherName}_${course_code}.pdf"`
        });

        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });

}


exports.attendanceOnly = function(req, res){
    let teacher = new Teacher(req.body)
    console.log(req.body, 'from attendanceOnly on teachers controller')
    teacher.insertAttendanceOnly().then((result) => {
        res.redirect(`/courses/grading/${req.body.Coursecode}/${req.body.credit}`)
        
    })
    .catch((result) => {
        
        res.redirect('/')
    })
}

exports.CTOnly = function(req, res){
    console.log(req.body)
}
