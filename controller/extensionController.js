const Extension = require('../model/Extension')


exports.dataCollectorEnterPress = function(req, res){

    console.log("request successfully reached from outside api....", req.body)
    let extension = new Extension(req.body)
    extension.insertToDB().then((result)=>{
        console.log(result, '<---result')
        res.json({
            "state": "reached successfully"
        })
    }).catch((error)=>{
        console.log(error, '<---error')
        res.json({
            "state": "reached successfully"

    })
})

}