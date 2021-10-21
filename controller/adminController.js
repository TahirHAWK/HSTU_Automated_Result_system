const teachersController = require('../controller/teachersController')
const Admin = require('../model/Admin')
const Teacher = require('../model/Teacher')



exports.register = function(req, res){
    let teacher = new Teacher(req.body)
    teacher.cleanUp()
    teacher.validate()
    if(teacher.errors.length){
        req.flash('errors', teacher.errors)
        req.session.save(function(){
            res.redirect('/')
        })
        
    } else {
        
    }

}

exports.login = function(req, res){

}

exports.logOut = function(req, res){
    req.session.destroy(function(){
        res.redirect('/adminHome')
    })
}


exports.home = function(req, res){
    
    let admin = new Admin(req.body)
    
    

    if(req.session.user){
        res.render('adminDashboard', {registerName: req.session.user.registerName, from: 'adminDashboard'})
    } else {
        res.render('adminGuest', {errors: req.flash('errors'), from: 'adminGuest'})
        // we could've wrote req.session.user.flash.errors to access the flash data but we want to access it and delete it as soon as we access it, that's why the flash method is used in the errors: req.flash('errors') instead of accessing the session.
    }
}






