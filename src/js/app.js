import $ from 'jquery';
import {parseCode,table} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let str = table(parsedCode);
        console.log("Hello world!");
        console.log(parsedCode);


        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
