// data elements using id as they are only one data on the webpage 
let courseTitle = document.getElementById('courseTitle')
let course_code = document.getElementById('course_code')
let creditHour = document.getElementById('creditHour')
 fullMarks = document.getElementById('fullMarks')
let teacherName = document.getElementById('teacherName')
let excelExport = document.getElementById('excelExport')

// data elements using classes because all students has same fields of data, ex: id, marks etc.
let ID_Number = document.getElementsByClassName('ID_Number')
let Attendance = document.getElementsByClassName('Attendance')
let ClassTest = document.getElementsByClassName('ClassTest')
let Mid = document.getElementsByClassName('Mid')
let FinalA = document.getElementsByClassName('FinalA')
let FinalB = document.getElementsByClassName('FinalB')
let Total = document.getElementsByClassName('Total')
let Marks = document.getElementsByClassName('Marks')
let LetterGrade = document.getElementsByClassName('LetterGrade')
let GradePoint = document.getElementsByClassName('GradePoint')


function arrayMakerFromElementValue(elementName) {
    let emptyElement = []
    let arrayMakerFromElementValuePromise = new Promise((resolve, reject)=>{

    for(i=0; i<=elementName.length; i++){
        emptyElement.push(elementName[i].value) 
        console.log(elementName[i].value)
        
    }
    
    console.log(emptyElement, 'from array maker')
    resolve(emptyElement)
    })

    return arrayMakerFromElementValuePromise

}


function generateExcel() {
    let something = arrayMakerFromElementValue(ID_Number)
    console.log(something, 'from generate excel')
}

excelExport.addEventListener('click', generateExcel)
