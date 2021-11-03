const mongodb = require('mongodb')

let connectionString = 'mongodb://localhost:27017/result_system?readPreference=primary&appname=MongoDB%20Compass&ssl=false'
// for offline

// always commit your changes to github after activating the online string and turning off the offline.


// let connectionString = 'mongodb+srv://appdev:appdev@appdev.6ppvo.mongodb.net/AppDev?retryWrites=true&w=majority'
// for online


let port = process.env.PORT
if(port == null || port == ""){
  port = 3000
}

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client){ 
  if(err){
    console.log('You have some errors: ',err)
  }
  module.exports = client

  // the require ./app file must be after client, otherwise it would generate an error.
  const app = require('./app')
    app.listen(port)
    console.log(`-------------------- Connected to db and port ${port} --------------------`)
})

