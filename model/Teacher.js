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
             //   console.log('from detectDup', this.errors)
            resolve(this.errors)

         
        } else {

             //   console.log("from detect Duplicate, no duplicates found.")
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
                      //   console.log('from register model on resolve: ', this.errors, result)
                     resolve(this.errors)
                    }
                    )
                .catch(
                (result) => {
                 //   console.log('from register model on reject: ', this.errors, result)
                        
                if(!this.errors.length && result == 'not found'){
                    // if no error is found then it will hash and insert inside db
                    let salt = bcrypt.genSaltSync(10)
                    this.data.registerPassword = bcrypt.hashSync(this.data.registerPassword, salt)
                    teachersAuth.insertOne(this.data).then(()=>{
                        
                        reject('inserted')
                    }
                         //   console.log('data inserted with password hashing.')
                        )
                        
                }
                else{
                     //   console.log('after rejects on model with no duplicate bt cleanup and validation: ',this.errors, result)
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
             //   console.log('user found from User model login prototype: ', attemptedUser)
            resolve(attemptedUser)
        } else { 
             //   console.log('user not found from User model login prototype!!!')
            reject('invalid username/password!!!!')

        }
    }).catch(function(){
        reject("Please try again later.")
    })
    })
    return loginPromise
}


Teacher.prototype.fetchAssignedCourses = function(){
    // console.log('from fetchAssignedCoures, ', this.data.teacherID)
    let fetchCoursePromise = new Promise((resolve, reject) => {
        courseInfo.find({assignedTeacherID: this.data.teacherID }).toArray()
        .then(  
            (result) => {
                 //   console.log(result)
                resolve(result)
            }
        ).catch( 
            (errors) => {
                 //   console.log('cannot find fetch courses for this teacher(on fetchAssignedCourses model).')
                reject(errors)
            }
        )
    })
    return fetchCoursePromise
}


Teacher.prototype.showCourseGrades = function(){
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

Teacher.prototype.checkDataRangeValidity = function(FieldName, value, fullMarks){
    // checking if the entered value is negative.
    if(value < 0){
      console.log('Marks cannot be negative.')
      value = 0
    }
    let maxAttendance 
      let maxCT 
      let maxMid 
      let maxPartA 
      let maxPartB 
    // so the fullMarks value is accessible from this function
    if(fullMarks == 150){
       maxAttendance = 15
       maxCT = 15
       maxMid = 30
       maxPartA = 45
       maxPartB = 45
    } else {
       maxAttendance = 10
       maxCT = 10
       maxMid = 20
       maxPartA = 30
       maxPartB = 30          
    }

    if(FieldName == 'Attendance'){
      if(Number(value) > Number(maxAttendance)){
        console.log('Out of range, please note that for '+ fullMarks + ' marks exam, the maximum mark for attendance is ' + maxAttendance+ '. But you typed ' + value + '.')
        return 0
      }
      else {
        return value
      }
      
    }
    else if(FieldName == 'ClassTest' ) {
      if(Number(value) > Number(maxCT)){
        console.log('Out of range, please note that for '+ fullMarks + ' marks exam, the maximum mark for class test is ' + maxCT + '.')
        return 0
      }
      else {
        return value
      }
    }
    else if(FieldName == 'Mid' ) {
      if(Number(value) > Number(maxMid)){
        console.log('Out of range, please note that for '+ fullMarks + ' marks exam, the maximum mark for mid is ' + maxMid + '.')
        return 0
      }
      else {
        return value
      }
    }
    else if(FieldName == 'FinalA' ) {
      if(Number(value) > Number(maxPartA)){
        console.log('Out of range, please note that for '+ fullMarks + ' marks exam, the maximum mark for Final part A is ' + maxPartA + '.')
        return 0
      }
      else {
        return value
      }
    }
    else if(FieldName == 'FinalB' ) {
      if(Number(value) > Number(maxPartB)){
        console.log('Out of range, please note that for '+ fullMarks + ' marks exam, the maximum mark for Final part B is ' + maxPartB + '.')
        return 0
      }
      else {
        return value
      }
    }
    else{
      console.log('non existance of field.')
    }
  }

Teacher.prototype.convertDataForDB = function(credit){

    let convertPromise = new Promise((resolve, reject) => {
        let totalMarks = this.data.totalMarks
        let course_code = this.data.Coursecode[1]
        let formDataArray = this.data 
        let formDataObject = []
        for( i = 0; i < formDataArray.ID_Number.length; i++ ){
                // this is the part where the form data is checked if that is within the right range or not.
                 formDataArray.Attendance[i] = this.checkDataRangeValidity('Attendance',Number(formDataArray.Attendance[i]), Number(totalMarks))
                 formDataArray.ClassTest[i] = this.checkDataRangeValidity('ClassTest',Number(formDataArray.ClassTest[i]), Number(totalMarks))
                 formDataArray.Mid[i] = this.checkDataRangeValidity('Mid',Number(formDataArray.Mid[i]), Number(totalMarks))
                 formDataArray.FinalA[i] = this.checkDataRangeValidity('FinalA',Number(formDataArray.FinalA[i]), Number(totalMarks))
                 formDataArray.FinalB[i] = this.checkDataRangeValidity('FinalB',Number(formDataArray.FinalB[i]), Number(totalMarks))

                let total = (Number(formDataArray.Attendance[i]) + Number(formDataArray.ClassTest[i]) + Number(formDataArray.Mid[i]) + Number(formDataArray.FinalA[i]) + Number(formDataArray.FinalB[i]))
    
                let marks = ((100*Number(total))/Number(totalMarks))
    
                let letterGrade
                let gradePoint
    
                let calculatedGPA = this.GPAandLetterGradeCalculator(marks, letterGrade, gradePoint)
                // returns --> {GradePoint: gradePoint, LetterGrade: letterGrade}
                letterGrade = calculatedGPA.LetterGrade
                gradePoint = calculatedGPA.GradePoint
    
             attendance1 = {
                ID_Number: formDataArray.ID_Number[i], 
                Attendance: Number(formDataArray.Attendance[i]), 
                ClassTest: Number(formDataArray.ClassTest[i]),
                Mid: Number(formDataArray.Mid[i]),
                FinalA: Number(formDataArray.FinalA[i]),
                FinalB: Number(formDataArray.FinalB[i]),
                Coursecode: formDataArray.Coursecode[i],
                Total: total,
                Marks: marks,
                LetterGrade: letterGrade,
                GradePoint: gradePoint,
                Coursecode: course_code,
                credit: Number(credit)
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

        // console.log(formDataObject, "<<form data object>>")

        gradeInfo.deleteMany({Coursecode: Coursecode}).then(
            (s) => {
                gradeInfo.insertMany(formDataObject).then(
                    (ss) => {
                        resolve()
                    }
                )
            }
        ) .catch((error) => {
             //   console.log('cannot deletemany')
            reject('error')
        })
        
    })
    return submitPromise
}

Teacher.prototype.finalSubmit = function(){
    let submitPromise = new Promise((resolve, reject) => {
        courseInfo.updateOne({course_code: this.data.course_code},{$set: {finalSubmission: true}}).then(
            (result) => {
                // console.log(result)
                resolve(result)
            }
        ).catch(
            (error) => {
                 //   console.log('cannot update data for finalSubmit.')
                reject(error)
            }
        )
    })
    return submitPromise
}

Teacher.prototype.calculationForSingleMarkOnly = function(dataToWorkwith){
   
    dataToWorkwith.Total = dataToWorkwith.Attendance + dataToWorkwith.ClassTest + dataToWorkwith.Mid + dataToWorkwith.FinalA + dataToWorkwith.FinalB
    dataToWorkwith.Marks = (100*dataToWorkwith.Total)/Number(this.data.fullMarks)

    let calculatedGrades = this.GPAandLetterGradeCalculator(dataToWorkwith.Marks, dataToWorkwith.GradePoint, dataToWorkwith.LetterGrade)
    dataToWorkwith.GradePoint = calculatedGrades.GradePoint
    dataToWorkwith.LetterGrade = calculatedGrades.LetterGrade

}

Teacher.prototype.GPAandLetterGradeCalculator = function(marks, gradePoint, letterGrade){
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
    return {GradePoint: gradePoint, LetterGrade: letterGrade}
}

Teacher.prototype.insertAttendanceOnly = function(){
    let singleAttendance = this.data
    let insertAttendancePromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: this.data.Coursecode}).toArray()
        .then((result) => {
            // console.log(singleAttendance, "<<-- from submitted form on frontend")
            for(i=0; i<singleAttendance.Attendance.length; i++){
                result[i].Attendance = Number(singleAttendance.Attendance[i])
                // check if the data entered is from correct range or not
                result[i].Attendance = this.checkDataRangeValidity('Attendance', result[i].Attendance, singleAttendance.fullMarks)
                // should do the calculation of each students grades before submission to db
               this.calculationForSingleMarkOnly(result[i])
            }   
        //  console.log(result, '->>changed array')
            let changedResult = result
            gradeInfo.deleteMany({Coursecode: this.data.Coursecode})
            .then((s)=> {
                gradeInfo.insertMany(changedResult)
                .then((ss)=> {
                    resolve()
                })
            })
        }).catch((error)=> {
             //   console.log(error, "<<cannot update only attendance mark>>")
            reject()
        })
        
       
   })
   return insertAttendancePromise
    
}

Teacher.prototype.insertCTOnly = function(){
    let singleCT = this.data
    let insertCTPromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: this.data.Coursecode}).toArray()
        .then((result) => {
            // console.log(singleCT, "<<-- from submitted form on frontend")
            for(i=0; i<singleCT.ClassTest.length; i++){
                result[i].ClassTest = Number(singleCT.ClassTest[i])
                // check if the data entered is from correct range or not
                result[i].ClassTest = this.checkDataRangeValidity('ClassTest', result[i].ClassTest, singleCT.fullMarks)
                // should do the calculation of each students grades before submission to db
               this.calculationForSingleMarkOnly(result[i])
            }   
        //  console.log(result, '->>changed array')
            let changedResult = result
            gradeInfo.deleteMany({Coursecode: this.data.Coursecode})
            .then((s)=> {
                gradeInfo.insertMany(changedResult)
                .then((ss)=> {
                    resolve()
                })
            })
        }).catch((error)=> {
             //   console.log(error, "<<cannot update only CT mark>>")
            reject()
        })
        
       
   })
   return insertCTPromise
    
}


Teacher.prototype.insertMidOnly = function(){
    let singleMid = this.data
    let insertMidPromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: this.data.Coursecode}).toArray()
        .then((result) => {
            // console.log(singleCT, "<<-- from submitted form on frontend")
            for(i=0; i<singleMid.Mid.length; i++){
                result[i].Mid = Number(singleMid.Mid[i])
                // check if the data entered is from correct range or not
                result[i].Mid = this.checkDataRangeValidity('Mid', result[i].Mid, singleMid.fullMarks)
                // should do the calculation of each students grades before submission to db
                this.calculationForSingleMarkOnly(result[i])
            }   
        //  console.log(result, '->>changed array')
            let changedResult = result
            gradeInfo.deleteMany({Coursecode: this.data.Coursecode})
            .then((s)=> {
                gradeInfo.insertMany(changedResult)
                .then((ss)=> {
                    resolve()
                })
            })
        }).catch((error)=> {
             //   console.log(error, "<<cannot update only CT mark>>")
            reject()
        })
        
       
   })
   return insertMidPromise
    
}

Teacher.prototype.insertFinalAOnly = function(){
    let singleFinalA = this.data
    let insertFinalAPromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: this.data.Coursecode}).toArray()
        .then((result) => {
            // console.log(singleCT, "<<-- from submitted form on frontend")
            for(i=0; i<singleFinalA.FinalA.length; i++){
                result[i].FinalA = Number(singleFinalA.FinalA[i])
                // check if the data entered is from correct range or not
                result[i].FinalA = this.checkDataRangeValidity('FinalA', result[i].FinalA, singleFinalA.fullMarks)

                // should do the calculation of each students grades before submission to db
               this.calculationForSingleMarkOnly(result[i])
            }   
        //  console.log(result, '->>changed array')
            let changedResult = result
            gradeInfo.deleteMany({Coursecode: this.data.Coursecode})
            .then((s)=> {
                gradeInfo.insertMany(changedResult)
                .then((ss)=> {
                    resolve()
                })
            })
        }).catch((error)=> {
             //   console.log(error, "<<cannot update only CT mark>>")
            reject()
        })
        
       
   })
   return insertFinalAPromise
    
}

Teacher.prototype.insertFinalBOnly = function(){
    let singleFinalB = this.data
    let insertFinalBPromise = new Promise((resolve, reject) => {
        gradeInfo.find({Coursecode: this.data.Coursecode}).toArray()
        .then((result) => {
            // console.log(singleCT, "<<-- from submitted form on frontend")
            for(i=0; i<singleFinalB.FinalB.length; i++){
                result[i].FinalB = Number(singleFinalB.FinalB[i])
                // check if the data entered is from correct range or not
                result[i].FinalB = this.checkDataRangeValidity('FinalB', result[i].FinalB, singleFinalB.fullMarks)
                // should do the calculation of each students grades before submission to db
               this.calculationForSingleMarkOnly(result[i])
            }   
        //  console.log(result, '->>changed array')
            let changedResult = result
            gradeInfo.deleteMany({Coursecode: this.data.Coursecode})
            .then((s)=> {
                gradeInfo.insertMany(changedResult)
                .then((ss)=> {
                    resolve()
                })
            })
        }).catch((error)=> {
             //   console.log(error, "<<cannot update only CT mark>>")
            reject()
        })
        
       
   })
   return insertFinalBPromise
    
}




module.exports = Teacher