const adminAuth = require('../db').db().collection('adminAuth')



let Admin = function(data){
    this.data = data;
    this.errors= []
}




module.exports = Admin