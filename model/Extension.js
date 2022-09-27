const ExtensionData = require('../db').db().collection('ExtensionData')

let Extension = function(data){
    this.data = data
    this.errors = []
}
// 01736573635
Extension.prototype.insertToDB = function(){
    let insertToDBPromise = new Promise((resolve, reject)=>{
        let date = new Date()
        ExtensionData.insertOne({date: date, userData: this.data}).then((result)=>{
            resolve(this.data)
        }).catch((error)=>{
            this.errors.push(error)
            reject()
        })
    

    })
    return insertToDBPromise
}



module.exports = Extension