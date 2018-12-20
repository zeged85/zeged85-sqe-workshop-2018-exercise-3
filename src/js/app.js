import $ from 'jquery';
import {parseCode,table,coverage} from './code-analyzer';


var escodegen = require('escodegen');
//var safeEval = require('safe-eval')

//change test for travis


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let argsToParse = $('#argumentsPlaceholder').val();
        console.log(argsToParse);
        //one before linting
        let parsedArguments = parseCode(argsToParse);
        if (parsedArguments.body[0]){
            console.log('we have args');
            console.log('input args length:' + parsedArguments.body[0].expression.expressions.length);
        }


        let parsedCode = parseCode(codeToParse);


        console.log(parsedCode);
        console.log(parsedArguments);
        let textedCode, ifStatements
        let myRes    = table(parsedCode,parsedArguments.body);
        textedCode = myRes[0];
        ifStatements = myRes[1];

        console.log(escodegen.generate(parsedCode));
        //console.log(safeEval('(3+5)<3'));

        //let cvr = coverage(str);

        //console.log(cvr);

        //let textedCode = escodegen.generate(parsedCode);

        console.log('ok code:')

        console.log(textedCode);

        let coloredCode = textedCode.split('\n');

        let coloredHTML = '<br>'
        let counter=0;
        for (let line in coloredCode){
            console.log(line)
            console.log(coloredCode[line])
            if (coloredCode[line].includes(' if ')){
                if (ifStatements[counter]==='true'){
                    console.log('true')
                    coloredHTML += '<span style="background-color: #00FF00">' + coloredCode[line] + '</span><br>';
                }
                else if (ifStatements[counter]==='false'){
                    console.log(false);
                    coloredHTML += '<span style="background-color: #FF0000">' + coloredCode[line] + '</span><br>';
                }
                else{
                    coloredHTML += '<span>' + coloredCode[line] + '</span><br>';
                }
                counter++;
            }
            else {
                coloredHTML += '<span>' + coloredCode[line] + '</span><br>';
            }
        }

        console.log(coloredHTML);

        $('#parsedCode').html(coloredHTML);
/*
        let res = makeTableHTML(str);
        //console.log(res);
        let pageTable = document.getElementById('parsedTable');
        fillTableData(pageTable,str);

        $('#parsedTable').val(res);
        */


    });
});

function makeTableHTML(myArray) {
    let result = '<table border=1>';
    for(let i=0; i<myArray.length; i++) {
        result += '<tr>';
        for(let j=0; j<myArray[i].length; j++){
            result += '<td>'+myArray[i][j]+'</td>';
        }
        result += '</tr>';
    }
    result += '</table>';

    return result;
}

function fillTableData(table,data){
    let i = 0;
    for (let x in data){
        i++;
        let row = table.insertRow(i);
        let j = 0;
        if (data.hasOwnProperty(x)) {
            for (let y in data[x]) {
                let cell1 = row.insertCell(j);
                j++;
                if (data[x].hasOwnProperty(y)) {
                    cell1.innerHTML = data[x][y];
                }
            }
        }
    }
}