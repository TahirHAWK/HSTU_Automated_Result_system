const teachersCollection = require('../db').db().collection('teachersAuth')


let Teacher = function(data){
    this.data = data
    this.errors = []
}

