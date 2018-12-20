import $ from 'jquery';
import {parseCode,table} from './code-analyzer';


var escodegen = require('escodegen');
//var safeEval = require('safe-eval')

//change test for travis


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let argsToParse = $('#argumentsPlaceholder').val();

        let parsedArguments = parseCode(argsToParse);



        let parsedCode = parseCode(codeToParse);


        let textedCode, ifStatements
        let myRes    = table(parsedCode,parsedArguments.body);
        textedCode = myRes[0];
        ifStatements = myRes[1];



        //let textedCode = escodegen.generate(parsedCode);


        let coloredCode = textedCode.split('\n');

        let coloredHTML = '<br>'
        let counter=0;
        for (let line in coloredCode){

            if (coloredCode[line].includes(' if ')){
                if (ifStatements[counter]==='true'){

                    coloredHTML += '<span style="background-color: #00FF00">' + coloredCode[line] + '</span><br>';
                }
                else if (ifStatements[counter]==='false'){

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



        $('#parsedCode').html(coloredHTML);



    });
});

