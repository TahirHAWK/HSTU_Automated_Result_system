const Student = require('../model/Student')

exports.register = function(req, res){
    let student = new Student(req.body)
    student.register().then((result) => {
        if(student.errors.length){
        console.log('from register controller if resolves',student.errors, result)
        req.flash('errors', student.errors)
        req.session.save(function(){
            res.redirect('/studentHome')
        })
        
    }
    }).catch((errors) => {
        
            console.log('from register controller if rejects', errors)
    
            req.session.student = {favColor: 'blue', registerName: student.data.registerName, registerEmail: student.data.registerEmail,registerID: student.data.registerID, loginAs: 'student', registerDepartment: student.data.registerDepartment}
            req.session.save(function(){
                res.redirect('/studentHome')
            })
        }
    )

}

exports.login = function(req, res){
    console.log('from controller login: ', req.body)
    let student = new Student(req.body)
    student.login()
    .then(function(result){
        // setting up sessions
        console.log('result after executing student.login() function:',result)
        req.session.student = {favColor: 'blue', registerEmail: result.registerEmail, registerName: result.registerName, registerID: result.registerID, loginAs: 'student', registerDepartment: result.registerDepartment}
        console.log(req.session.student)
        // even though in the upper line, while updating the session object, its also sends the data to mongodb and then redirects, as accessing db is async process we need to manually save the data to db so that we can set its next process of redirect as it is done.
        req.session.save(function(){
            console.log('studentController.login: redirecting to homepage after saving session:   ')
            res.redirect('/studentHome')  
        })
        // sending response with persistant session data
        })
        .catch(function(err){
            req.flash('errors', err)
            // req.session.flash.errors = [err]
            // the flash package will make a new object in session named 'flash', inside there will be a new property named 'errors' that we made above, in there, will be an array where err from function response will pushed onto. which we can leverage it later.
            // as flash creates a new object inside session and session is inside db, so flash has to interact with db as well, and its an async request and takes time, so here its manually saved with a callback of redirect to homepage after saving to db.
            req.session.save(function(){
                res.redirect('/studentHome')
            })
            }) 
}

exports.logOut = function(req, res){
    req.session.destroy(function(){
        res.redirect('/studentHome')
    })
}

exports.home = function(req, res){

    let student = new Student(req.body)
    if(req.session.student && req.session.student.loginAs == 'student'){
        res.render('studentDashboard', {registerName: req.session.student.registerName, from: 'studentDashboard'})
    } else {
        res.render('studentGuest', {errors: req.flash('errors'), from: 'studentGuest'})
        // we could've wrote req.session.user.flash.errors to access the flash data but we want to access it and delete it as soon as we access it, that's why the flash method is used in the errors: req.flash('errors') instead of accessing the session.
    }
}

exports.showSingleResult = function(req, res){
    let student = new Student(req.params.Levelsemester)
    student.findResultOfStudent(req.session.student).then((result) => {

        res.render('studentSingleResult', {Levelsemester: req.params.Levelsemester, from: 'studentDashboard', studentMarks: result, studentDetail: req.session.student})
    })

}