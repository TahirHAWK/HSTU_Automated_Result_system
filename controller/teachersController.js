const teachersCollection = require('../db').db().collection('teachersAuth')

exports.register = function(req, res){
    
    res.redirect('/')
}

exports.home = function(req, res){
    teachersCollection.findOne().then(function(doc){
        res.render('teacherHome', {name: doc.username})
    })
    
}