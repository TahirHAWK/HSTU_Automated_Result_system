const { result } = require('lodash');
const _ = require('lodash');

exports.arrays = function(req, res){
    let results = [
      {
        ID_Number: '1602026',
        Coursecode: 'CSE 252',
        LetterGrade: 'F',
        GradePoint: 0,
        credit: 1.5
      },
      {
        ID_Number: '1802026',
        Coursecode: 'CSE 252',
        LetterGrade: 'F',
        GradePoint: 0,
        credit: 1.5
      },
      {
        ID_Number: '1802063',
        Coursecode: 'CSE 252',
        LetterGrade: 'A+',
        GradePoint: 4,
        credit: 1.5
      },
      {
        ID_Number: '1802004',
        Coursecode: 'CSE 252',
        LetterGrade: 'F',
        GradePoint: 0,
        credit: 1.5
      },
      {
        ID_Number: '1802037',
        Coursecode: 'CSE 252',
        LetterGrade: 'F',
        GradePoint: 0,
        credit: 1.5
      },
      {
        ID_Number: '1802076',
        Coursecode: 'CSE 252',
        LetterGrade: 'F',
        GradePoint: 0,
        credit: 1.5
      },
      {
        ID_Number: '1602026',
        Coursecode: 'CSE 252',
        LetterGrade: 'F',
        GradePoint: 0,
        credit: 1.5
      },
      {
        ID_Number: '1702007',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1802028',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1802065',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1802008',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1802039',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1802078',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1802063',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 255',
        credit: 3
      },
      {
        ID_Number: '1702048',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 259',
        credit: 3
      },
      {
        ID_Number: '1802032',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 259',
        credit: 3
      },
      {
        ID_Number: '1802070',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 259',
        credit: 3
      },
      {
        ID_Number: '1802012',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 259',
        credit: 3
      },
      {
        ID_Number: '1802046',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 259',
        credit: 3
      },
      {
        ID_Number: '1802063',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 259',
        credit: 3
      },
      {
        ID_Number: '1702057',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 261',
        credit: 2
      },
      {
        ID_Number: '1802033',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 261',
        credit: 2
      },
      {
        ID_Number: '1802071',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 261',
        credit: 2
      },
      {
        ID_Number: '1802013',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 261',
        credit: 2
      },
      {
        ID_Number: '1802049',
        LetterGrade: '',
        GradePoint: NaN,
        Coursecode: 'CSE 261',
        credit: 2
      }
    ] ;
      
      let Coursecodes = [ 'CSE 252', 'CSE 255', 'CSE 259', 'CSE 261' ];
      let credits = [ 1.5, 3, 3, 2 ] 
      let studentids = [
        '1602026', '1702007', '1702048',
        '1702057', '1802004', '1802008',
        '1802012', '1802013', '1802026',
        '1802028', '1802032', '1802033',
        '1802037', '1802039', '1802046',
        '1802049', '1802063', '1802065',
        '1802070', '1802071', '1802076',
        '1802078'
      ]
      
      studentids.forEach((id) => {
       let emptyGrades = []
      for(i=0; i<Coursecodes.length; i++){
        for(j=0; j<results.length; j++){
          if(Coursecodes[i] == results[j].Coursecode && id == results[j].ID_Number){

            let singleGrade = {
              GradePoint: results[j].GradePoint, LetterGrade: results[j].LetterGrade,
              Coursecode: results[j].Coursecode, credit: results[j].credit 
            }
            emptyGrades.push(singleGrade)
          } 
          }

        }
      

      let grades = {
        ID_Number: id, grades: emptyGrades
      }
      console.log(grades)
    })

res.send('loads without error')
       
}

