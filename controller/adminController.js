const Admin = require('../model/Admin')




exports.register = function(req, res){
    let admin = new Admin(req.body)
    admin.register().then((result) => {
        if(admin.errors.length){
        console.log('from register controller if resolves',admin.errors, result)
        req.flash('errors', admin.errors)
        req.session.save(function(){
            res.redirect('/adminHome')
        })
        
    }
    }).catch((errors) => {
        
            console.log('from register controller if rejects', errors)
    
            req.session.admin = {favColor: 'blue', registerName: admin.data.registerName, registerEmail: admin.data.registerEmail, registerDepartment: admin.data.registerDepartment, loginAs: 'admin'}
            req.session.save(function(){
                res.redirect('/adminHome')
            })
        }
    )
    
  

}

exports.login = function(req, res){
    console.log('from controller login: ', req.body)
    let admin = new Admin(req.body)
    admin.login()
    .then(function(result){
        // setting up sessions
        console.log('result after executing admin.login() function:',result)
        req.session.admin = {favColor: 'blue', registerEmail: result.registerEmail, registerName: result.registerName, registerDepartment: result.registerDepartment ,loginAs: 'admin'}
        console.log(req.session.admin)
        // even though in the upper line, while updating the session object, its also sends the data to mongodb and then redirects, as accessing db is async process we need to manually save the data to db so that we can set its next process of redirect as it is done.
        req.session.save(function(){
            console.log('adminController.login: redirecting to homepage after saving session:   ')
            res.redirect('/adminHome')  
        })
        // sending response with persistant session data
        })
        .catch(function(err){
            req.flash('errors', err)
            // req.session.flash.errors = [err]
            // the flash package will make a new object in session named 'flash', inside there will be a new property named 'errors' that we made above, in there, will be an array where err from function response will pushed onto. which we can leverage it later.
            // as flash creates a new object inside session and session is inside db, so flash has to interact with db as well, and its an async request and takes time, so here its manually saved with a callback of redirect to homepage after saving to db.
            req.session.save(function(){
                res.redirect('/adminHome')
            })
            })    
}

exports.logOut = function(req, res){
    req.session.destroy(function(){
        res.redirect('/adminHome')
    })
}


exports.home = function(req, res){
     
    let admin = new Admin(req.session.admin)
    if(req.session.admin && req.session.admin.loginAs == 'admin'){
        admin.showAllCourses() 
        .then((result) =>{
            res.render('adminDashboard', {registerName: req.session.admin.registerName, courseData: result, from: 'adminDashboard'})
        })         
            .catch((error) => 
                { 
                    console.log('on rejection of show all courses: ',error)
                }
        )
            } 
     else {
        res.render('adminGuest', {errors: req.flash('errors'), from: 'adminGuest'})
        // we could've wrote req.session.user.flash.errors to access the flash data but we want to access it and delete it as soon as we access it, that's why the flash method is used in the errors: req.flash('errors') instead of accessing the session.
    }
}



exports.assignTeacher = function(req, res){
    console.log(req.session.admin)
    let courseCodeNow = req.params.id
    let admin = new Admin(req.session.admin)
    admin.showAllTeachers().then(
        (result) =>{
            res.render('singleCourseAdmin', {teacherData: result, courseCodeNow, from: 'adminDashboard'}) 
        }
    ).catch(
        (error) => { 
            console.log('cannot show teachers, in assignTeacher from admin controller.', error)
        res.redirect('/adminHome')
        }
    )
    
}




