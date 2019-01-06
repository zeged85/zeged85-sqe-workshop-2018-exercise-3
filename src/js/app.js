import $ from 'jquery';
import {parseCode,table} from './code-analyzer';
import * as david from 'viz.js';
import * as esprima from 'esprima';

//import * as flowchart from 'flowchart.js';

var escodegen = require('escodegen');
var esgraph = require('esgraph');
//var flowchart = require('flowchart.js');


//change test for travis



$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {

        let codeToParse = $('#codePlaceholder').val();
        let argsToParse = $('#argumentsPlaceholder').val();

        let parsedArguments = parseCode(argsToParse);



        let parsedCode = parseCode(codeToParse);



        console.log(parsedCode);

        let textedCode, ifStatements
        let myRes    = table(parsedCode,parsedArguments.body);
        //textedCode = myRes[0];
        //ifStatements = myRes[1];

        console.log('if statements:');
        //console.log(ifStatements)




        console.log(parsedCode);
        console.log(5+6);



        let svg = david( 'digraph {'  + myRes + '}');
       // let svg = david( 'digraph {'  + newGraph + '}');

        //console.log(svg);










        //let textedCode = escodegen.generate(parsedCode);

        /*

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

*/

        $('#parsedCode').html(svg);



    });
});

