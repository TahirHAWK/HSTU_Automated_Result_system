const teachersAuth = require('../db').db().collection('teachersAuth')
const Teacher = require('../model/Teacher')

exports.register = function(req, res){
    let teacher = new Teacher(req.body)
    teacher.register()
    if(teacher.errors.length){
        res.send(teacher.errors)
        
    } else {
        res.redirect('/')
    }
    
}

exports.login = function(req, res){
    console.log('from controller login: ', req.body)
    let teacher = new Teacher(req.body)
    teacher.login()
    res.redirect('/')
}

exports.home = function(req, res){
    teachersAuth.findOne().then(function(doc){
        res.render('teacherGuest', {name: doc.registerName})
    })
    
}