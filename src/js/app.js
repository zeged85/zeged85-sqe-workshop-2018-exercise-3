import $ from 'jquery';
import {parseCode,table} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let str = table(parsedCode);
        if (str){
            str;
        }
        //console.log('Hello world!');
        //console.log(parsedCode);


        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        let res = makeTableHTML(str);
        console.log(res);
        var pageTable = document.getElementById("parsedTable");

        let i = 0;
        for (var x in str){
            i++;
            var row = pageTable.insertRow(i);
            let j = 0;
            for (var y in str[x]){
                var cell1 = row.insertCell(j);
                j++;
                cell1.innerHTML = str[x][y];
            }
        }
       // var row = pageTable.insertRow(i);

        $('#parsedTable').val(res);


    });
});

function makeTableHTML(myArray) {
    var result = "<table border=1>";
    for(var i=0; i<myArray.length; i++) {
        result += "<tr>";
        for(var j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
