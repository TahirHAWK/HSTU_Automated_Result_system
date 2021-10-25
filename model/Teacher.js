const teachersAuth = require('../db').db().collection('teachersAuth')
const courseInfo = require('../db').db().collection('courseInfo')
const gradeInfo = require('../db').db().collection('gradeInfo')
const validator = require('validator')
const bcrypt = require('bcryptjs')

let Teacher = function(data){
    this.data = data
    this.errors = []
}

Teacher.prototype.cleanUp = function(){
    if(typeof(this.data.registerName) != 'string'){
        this.data.registerName = '';
    }
    if(typeof(this.data.registerEmail) != 'string'){
        this.data.registerEmail = '';
    }
    if(typeof(this.data.registerDesignation) != 'string'){
        this.data.registerDesignation = '';
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
        registerDesignation: this.data.registerDesignation.trim(),
        registerFaculty: this.data.registerFaculty.trim().toUpperCase(),
        registerDepartment: this.data.registerDepartment.trim().toUpperCase(),
        registerPassword: this.data.registerPassword
    }
    // trim() method will get rid of any empty spaces in the end or beginning of the text that was submitted by user.
    // toLowerCase() method will convert all the text of the field into lowercase letters which is necessary for username and email.
}


Teacher.prototype.validate = function(){
    // generate error for empty fields
    if(this.data.registerName == ""){
        this.errors.push(' You must provide a username ')}
    if(this.data.registerEmail == ""){
        this.errors.push(' You must provide an Email ')}
    if(this.data.registerDesignation == ""){
        this.errors.push(' You must provide your designation ')}
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

Teacher.prototype.detectDuplicate = function(){

    let detectPromise = new Promise((resolve, reject) => {
        teachersAuth.findOne({registerEmail: this.data.registerEmail})
    .then((result) => {
        if(result != null) {

             this.errors.push('The email you entered already assigned to another account. ')
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


Teacher.prototype.register =  function(){
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
                    teachersAuth.insertOne(this.data).then(
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
        
Teacher.prototype.login = function(){
    let loginPromise =  new Promise((resolve, reject) => {
        this.cleanUp()
    teachersAuth.findOne({registerEmail: this.data.registerEmail})
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


Teacher.prototype.fetchAssignedCourses = function(){
    console.log('from fetchAssignedCoures, ', this.data.teacherID)
    let fetchCoursePromise = new Promise((resolve, reject) => {
        courseInfo.find({assignedTeacherID: this.data.teacherID }).toArray()
        .then(  
            (result) => {
                console.log(result)
                resolve(result)
            }
        ).catch( 
            (errors) => {
                console.log('cannot find fetch courses for this teacher(on fetchAssignedCourses model).')
                reject(errors)
            }
        )
    })
    return fetchCoursePromise
}


Teacher.prototype.showCourseGrades = function(){
    console.log('from showCourseGrades', this.data.course_code)
    let showGradePromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: this.data.course_code}).toArray().then(
            (grade) => {
                resolve(grade)
            }
        ) 
        .catch(
            (error) =>{
                reject('Cannot find data.')
            }
        )
    })
    return showGradePromise
}

Teacher.prototype.convertDataForDB = function(){

    let convertPromise = new Promise((resolve, reject) => {
        let course_code = this.data.Coursecode[1]
        let formDataArray = this.data 
        let formDataObject = []
        for( i = 0; i < formDataArray.ID_Number.length; i++ ){
                let total = (Number(formDataArray.Attendance[i]) + Number(formDataArray.ClassTest[i]) + Number(formDataArray.Mid[i]) + Number(formDataArray.FinalA[i]) + Number(formDataArray.FinalB[i]))
    
                let marks = ((100*Number(total))/150)
    
                let letterGrade
                let gradePoint
    
                if (marks >= 80) {
                    letterGrade = 'A+';
                    gradePoint = 4.00;
                }
                else {
                if (marks >= 75 && marks <= 79) {
                letterGrade = 'A';
                gradePoint = 3.75
                }
                else {
                if (marks >= 70 && marks <= 74) {
                letterGrade = 'A-';
                gradePoint = 3.50
                }
                else {
                if (marks >= 65 && marks <= 69) {
                letterGrade = 'B+';
                gradePoint = 3.25
                }
                else {
                if (marks >= 60 && marks <= 64) {
                letterGrade = 'B';
                gradePoint = 3.00
                } else{
                if (marks >= 55 && marks <= 59) {
                letterGrade = 'B-';
                gradePoint = 2.75
                } else{
                if (marks >= 50 && marks <= 54) {
                    letterGrade = 'C+';
                    gradePoint = 2.50
                } else{
                if (marks >= 45 && marks <= 49) {
                    letterGrade = 'C';
                    gradePoint = 2.25
                } else{
                    if (marks >= 40 && marks <= 44) {
                        letterGrade = 'D';
                    gradePoint = 2.00
                } else{
                    if (marks < 40) {
                        letterGrade = 'F';
                        gradePoint = 0.00
                } else{
                            
                        }
                    }
                }
            }

                }

                }
                }
                }
                }
                }
    
             attendance1 = {
                ID_Number: formDataArray.ID_Number[i], 
                Attendance: formDataArray.Attendance[i], 
                ClassTest: formDataArray.ClassTest[i],
                Mid: formDataArray.Mid[i],
                FinalA: formDataArray.FinalA[i],
                FinalB: formDataArray.FinalB[i],
                Coursecode: formDataArray.Coursecode[i],
                Total: total,
                Marks: marks,
                LetterGrade: letterGrade,
                GradePoint: gradePoint,
                Coursecode: course_code
                }
            formDataObject.push(attendance1)
        }
        resolve(formDataObject)
    })
    return convertPromise
}

Teacher.prototype.submitTeacherGrade = function(formDataObject){
    let submitPromise = new Promise((resolve, reject) => {
        let Coursecode = formDataObject[1].Coursecode

   

        gradeInfo.deleteMany({Coursecode: Coursecode}).then(
            (s) => {
                gradeInfo.insertMany(formDataObject).then(
                    (ss) => {

                        resolve()

                    }
                )
    
            }
        ) .catch((error) => {
            console.log('cannot deletemany')
            reject('error')
        })
        
    })
    return submitPromise
}


module.exports = Teacher