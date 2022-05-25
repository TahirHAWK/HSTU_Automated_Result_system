

// data elements using id as they are only one data on the webpage 
let dataTable = document.getElementById('data-table-for-excel') 
let courseTitle = document.getElementById('courseTitle').value
let course_code = document.getElementById('course_code').value
// let creditHour = document.getElementById('creditHour')
//  fullMarks = document.getElementById('fullMarks')
let teacherName = document.getElementById('teacherName').value
// let excelExport = document.getElementById('excelExport')

// // data elements using classes because all students has same fields of data, ex: id, marks etc.
// let ID_Number = document.getElementsByClassName('ID_Number')
// let Attendance = document.getElementsByClassName('Attendance')
// let ClassTest = document.getElementsByClassName('ClassTest')
// let Mid = document.getElementsByClassName('Mid')
// let FinalA = document.getElementsByClassName('FinalA')
// let FinalB = document.getElementsByClassName('FinalB')
// let Total = document.getElementsByClassName('Total')
// let Marks = document.getElementsByClassName('Marks')
// let LetterGrade = document.getElementsByClassName('LetterGrade')
// let GradePoint = document.getElementsByClassName('GradePoint')





 function generateExcel() {


    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.table_to_sheet(dataTable);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data from Result Gradesheet");
    XLSX.writeFile(workbook, `${courseTitle}_${course_code}_${teacherName}.xlsx`);
 
}

excelExport.addEventListener('click', generateExcel)
 