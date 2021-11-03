const adminAuth = require('../db').db().collection('adminAuth')
const teachersAuth = require('../db').db().collection('teachersAuth')
const studentsAuth = require('../db').db().collection('studentsAuth')
const gradeInfo = require('../db').db().collection('gradeInfo')
const _ = require('lodash');
const courseInfo = require('../db').db().collection('courseInfo')
const validator = require('validator')
const bcrypt = require('bcryptjs')
   

let Admin = function(data){
    this.data = data;
    this.errors= []
}


Admin.prototype.cleanUp = function(){
    if(typeof(this.data.registerName) != 'string'){
        this.data.registerName = '';
    }
    if(typeof(this.data.registerEmail) != 'string'){
        this.data.registerEmail = '';
    }
    if(typeof(this.data.registerFaculty) != 'string'){
        this.data.registerFaculty = '';
    }
    if(typeof(this.data.registerDepartment) != 'string'){
        this.data.registerDepartment = '';
    }
    if(typeof(this.data.registerPassword) != 'string'){
        this.data.registerPassword = '';
    }
     // here we checked that, if the data submitted by user is not a string type data, it'll return an empty string.

     // get rid of any bogus properties that is not part of our data model.
    this.data = {
        registerName: this.data.registerName.trim(),
        registerEmail: this.data.registerEmail.trim().toLowerCase(),
        registerFaculty: this.data.registerFaculty.trim().toUpperCase(),
        registerDepartment: this.data.registerDepartment.trim().toUpperCase(),
        registerPassword: this.data.registerPassword
    }
    // trim() method will get rid of any empty spaces in the end or beginning of the text that was submitted by user.
    // toLowerCase() method will convert all the text of the field into lowercase letters which is necessary for username and email.
}


Admin.prototype.validate = function() {
    // generate error for empty fields
    if(this.data.registerName == ""){
        this.errors.push(' You must provide a username ')}
    if(this.data.registerEmail == ""){
        this.errors.push(' You must provide an Email ')}
    if(this.data.registerFaculty == ""){
        this.errors.push(' You must provide your faculty name ')}
    if(this.data.registerDepartment == ""){
        this.errors.push(' You must provide your department name ')}
    if(this.data.registerPassword == ""){
        this.errors.push(' You must provide your password ')}

    // generate error for formatting problems
    if(!validator.isEmail(this.data.registerEmail)){
        this.errors.push(' You must provide a valid email address ')
    }

}

Admin.prototype.detectDuplicate = function(){
    let detectPromise = new Promise((resolve, reject) => {
        adminAuth.findOne({registerDepartment: this.data.registerDepartment})
    .then((result) => {
        if(result != null) {

             this.errors.push('An admin/chairman is already assigned from your department. If you are new admin/chairman, please contact dean office for more information. ')
            console.log('from detectDup', this.errors)
            resolve(this.errors)

         
        } else {

            console.log("from detect Duplicate, no duplicates found.")
            reject('not found')
        }
        
    }
    )
    }) 
    return detectPromise
}

Admin.prototype.register = function(){
            let registerPromise = new Promise((resolve, reject) => {
            // adding methods to User object blueprint
            // step #1: validate user data
             this.cleanUp()
            // cleanUp function makes sure that the data is submitted by the user is not an array or an object or anything that is not a string. Also converts the data to usable format.
             this.validate()
            // step #2: only if there are no validation errors then save data into a database
            // step #3: check if that data already exists or not.
             this.detectDuplicate()
                .then(
                 (result) => {
                     console.log('from register model on resolve: ', this.errors, result)
                     resolve(this.errors)
                    }
                    )
                .catch(
                (result) => {
                console.log('from register model on reject: ', this.errors, result)
                         
                if(!this.errors.length && result == 'not found'){
                    // if no error is found then it will hash and insert inside db
                    let salt = bcrypt.genSaltSync(10)
                    this.data.registerPassword = bcrypt.hashSync(this.data.registerPassword, salt)
                   adminAuth.insertOne(this.data).then(
                        console.log('data inserted with password hashing.')
                        )
                        
                        reject('inserted')
                }
                else{
                    console.log('after rejects on model with no duplicate bt cleanup and validation: ',this.errors, result)
                    resolve(this.errors)
                    
                }
            }
             )
            })
            return registerPromise 
        }

Admin.prototype.login = function(){
    let loginPromise =  new Promise((resolve, reject) => {
        this.cleanUp()
    adminAuth.findOne({registerEmail: this.data.registerEmail})
        .then((attemptedUser) => {
        if(attemptedUser && bcrypt.compareSync(this.data.registerPassword, attemptedUser.registerPassword)){
            // bcrypt.compareSync is a method of the bcrypt package that compares two values that are accepted as parameters after hashing the first one.
            console.log('user found from User model login prototype: ', attemptedUser)
            resolve(attemptedUser)
        } else { 
            console.log('user not found from User model login prototype!!!')
            reject('invalid username/password!!!!')

        }
    }).catch(function(){
        reject("Please try again later.")
    })
    })
    return loginPromise
}

Admin.prototype.showAllCourses = function(){
    let showCoursePromise = new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        console.log('from show all courses model: ', this.data)
        courseInfo.find({assignedDepartment: this.data.registerDepartment}).sort({course_code: 1}).toArray().then((result) => {
            
            resolve(result)
        })
        .catch(
            (error) => {
                console.log(error)
                reject(error)
            }
        )

    })
    return showCoursePromise
}

Admin.prototype.showAllTeachers = function(){
    let showTeachersPromise = new Promise((resolve, reject) => {
        teachersAuth.find({registerDepartment: this.data.registerDepartment}).toArray().then((result) => {
            resolve(result)
        })
        .catch(
            (error) => {
                console.log(error)
                reject(error)
            }
        )

    })
    return showTeachersPromise
}


Admin.prototype.assignConfirm = function(){
    let courseCode = this.data.id
    let assignPromise = new Promise((resolve, reject) => {
        courseInfo.findOneAndUpdate({course_code: courseCode}, {$set: {assignedTeacher: this.data.assignedTeacher, assignedTeacherID: this.data.assignedTeacherID}})
        .then(
            (result) => {
                console.log('from assignconfirm model, on resolve: ', result)
                resolve(result)
            }
            )
            .catch((error) => {
            console.log('from assignconfirm model, on reject: ', error)
                reject(error)
            }

        )
    })
    return assignPromise
}


Admin.prototype.searchResultInfo = function(){
    let resultInfoPromise = new Promise((resolve, reject) => {
        const agg = [
            {
              '$match': {
                'degree': `${this.data.registerDepartment}`, 
                'finalSubmission': true
              }
            }, {
              '$group': {
                '_id': '$Levelsemester', 
                'totalCredit': {
                  '$sum': '$credit'
                }
              }
            }, {
                '$sort': {
                  '_id': 1
                }
              }
          ];
    
          courseInfo.aggregate(agg).toArray().then(
              (result) => {
                  console.log(result)
                resolve(result)
              }
          ).catch(
              (error) => {
                  reject(error)
              }
          )
    })
    return resultInfoPromise
    
}

Admin.prototype.getSingleResultData = function(){
    let projection = {degree: 0, assignedTeacher: 0, assignedTeacherID:0, finalSubmission: 0, assignedDepartment: 0}
    let singleResultPromise = new Promise((resolve, reject) => {
        courseInfo.find({
            degree: this.data.registerDepartment, 
            Levelsemester: this.data.Levelsemester,
            finalSubmission: true
        }, {projection: projection}).sort({course_code: 1}).toArray().then(
            (result) => {

                resolve(result) 
            }
        )
    })
  return singleResultPromise
}


Admin.prototype.showStudentMarks = function(courses){
    let projection = {_id: 0, Attendance: 0, ClassTest: 0, Mid: 0, FinalA:0, FinalB: 0, Total: 0, Marks: 0}
    let showStudentMarksPromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: {$in: courses}}, {projection: projection}).sort({Coursecode: 1}).toArray().then(
            (result) => {
                resolve(result)
            }
        ).catch(
            (error) => {
                console.log(error, 'oops error happened')
                reject(error)
            }
        )
    })

    return showStudentMarksPromise
}

Admin.prototype.extractIdFromGrades = function(studentGrades){
    let idPromise = new Promise((resolve, reject) => {
        // extracting only values from ID_Number field
        let onlyId = _.map(studentGrades, 'ID_Number')
        // removing duplicate values inside extracted array with id's
        let duplicateRemove = _.union(onlyId) 
        // sort id's in ascending order
        duplicateRemove= _.orderBy(duplicateRemove, [],['asc'])
        resolve(duplicateRemove)
    })
    return idPromise
}

Admin.prototype.changeSubmitStatus = function(course_code){
    let changeStatusPromise = new Promise((resolve, reject) => {
        courseInfo.findOneAndUpdate({course_code: course_code}, {$set: {finalSubmission: false}}).then((result) => {
            
            resolve(result)
        }).catch((error) => {
            
            reject(error)
        })
    })
    return changeStatusPromise
}



module.exports = Admin