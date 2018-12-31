import $ from 'jquery';
import {parseCode,table} from './code-analyzer';
import * as david from 'viz.js';
import * as esprima from 'esprima';

//import * as flowchart from 'flowchart.js';

var escodegen = require('escodegen');
var esgraph = require('esgraph');
var flowchart = require('flowchart.js');


//change test for travis


function removeExceptions(graph){

    for (let x in graph){
        if (graph[x].includes('exception')){
            graph.splice(x,1)
            x--;
        }
    }

    return graph;
}


function changeNodes(graph, thisNode, from, to){

    console.log('changing nodes')

    for (let x in graph){
        let name = thisNode + ' -> n' + from;


        if (graph[x].includes(name)){
            console.log(name)
            console.log(graph[x] )
            console.log('change :' + thisNode);
            console.log('from :' + from);
            console.log('to: ' + to);


            let newstr = graph[x].split('[')[0].replace(from,to) + '[' +  graph[x].split('[')[1];
            console.log(newstr)

            graph[x]= newstr;
        }
    }

}


function fixGraph(graph,n){
    console.log('there are ' + n + 'nodes');


    for (let x = n; x<graph.length; x++){

        console.log(graph[x]);
    }


    //find count x nodes w/ two+ inputs

    let inputCounter = {};

    //init array
    for (let x = 0; x<n; x++){
        console.log(x + '=0');
        inputCounter[x]=0;
    }

    console.log(graph)

    for (let x = n; x<graph.length; x++){

        //console.log(x + '<' + graph.length)
        //console.log(graph[x])
        let pre = graph[x].split('n')[2]
        //console.log(pre);
        //console.log(pre.split(' ')[0])
        let post = parseInt(pre.split(' ')[0]);
        //console.log(post);
        inputCounter[(post)]++;


    }

    console.log(inputCounter);

    let specialNodes = [];

    for (let x in inputCounter){
        if (inputCounter[x] >1){
            specialNodes.push(x);
        }
    }

    console.log(specialNodes);


    //for x
    //add null node above x1
    //attach null to x1

    //find all nodes that out into x1

        //reattach to new node




    let addToGraph = [];


    for (let y = 0; y < specialNodes.length; y++){


        console.log('shifting '+ n)
        graph.splice(n,0, 'n'+n +' [label="null"]')

        addToGraph.push('n'+n + '->n' + specialNodes[y] + ' []');

        for (let x = n; x<graph.length; x++) {

            //console.log(x + '<' + graph.length)
            //console.log(graph[x])
            let pre = graph[x].split('n')


            //console.log(pre);
            //console.log(pre.split(' ')[0])
            let post = parseInt(pre[2].split(' ')[0]);
            //console.log(post);

            //console.log(post + ' ? '+ specialNodes[y])


            if (post === parseInt(specialNodes[y])) {
                console.log('match!');
                console.log(graph[x]);

                let input = parseInt( pre[1].split(' ')[0] );

                console.log(input);


                changeNodes(graph, input, specialNodes[y], n);



            }

        }
        n+=1;
    }


    console.log('adding to graph');
    console.log((addToGraph))

    graph = graph.concat(addToGraph);

    return graph;


/*
    for (let line in graph){

        console.log('->'+graph[line]);
    }
    */
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {

        let codeToParse = $('#codePlaceholder').val();
        let argsToParse = $('#argumentsPlaceholder').val();

        let parsedArguments = parseCode(argsToParse);



        let parsedCode = parseCode(codeToParse);



        console.log(parsedCode);

        let textedCode, ifStatements
        let myRes    = table(parsedCode,parsedArguments.body);
        textedCode = myRes[0];
        ifStatements = myRes[1];

        console.log('if statements:');
        console.log(ifStatements)




        console.log(parsedCode);
        console.log(5+6);

        console.log(escodegen.generate(parsedCode));

        let cfg = esgraph(parsedCode.body[0].body);
        console.log('cfg');
        console.log(cfg);

        let graph = esgraph.dot(cfg);



        console.log('graph');
        console.log(graph);
        let nodeAmount = cfg[2].length;

        let nodeCount = 0;

        let splitGraph = graph.toString().split('\n');



        splitGraph.pop();

        //splitGraph.unshift('n13 []');

        let removedExceptions = removeExceptions(splitGraph);


        let fixedGraph = fixGraph(removedExceptions, nodeAmount);

        splitGraph = fixedGraph;





        let newGraph = '';
        let newLine = '';
        let statement = 0;

        for (let line in splitGraph){
            let newLine;
            let oldLine = splitGraph[line];

            //only change declerations
            if (nodeCount < nodeAmount) {
                let start = oldLine.indexOf('[');
                newLine = oldLine.slice(0, start + 1);

                //let nodeNum = nodeCount + 1;

                //if (nodeCount!=0 && nodeCount != nodeAmount-1 ){

                if (oldLine.includes('BinaryExpression') || oldLine.includes('Literal')){
                    console.log(ifStatements[statement]);
                    if (ifStatements[statement]==='true') {
                        newLine += 'color="green", ';
                    }
                    else if (ifStatements[statement]==='false') {
                        newLine += 'color="red", ';
                    }
                    statement++;
                }



                let removeLable = oldLine.indexOf('label=');
                console.log('labael is on ' + removeLable)
                if (removeLable > 0){
                    let ending = oldLine.indexOf('"',removeLable);
                    let nextEnd = oldLine.indexOf('"',ending + 1 );


                    if (oldLine.slice(nextEnd+1,nextEnd+2) ===',') {
                        console.log(oldLine.slice(nextEnd + 1, nextEnd + 2));
                        nextEnd += 1;
                    }

                    let oldLabel = oldLine.slice(removeLable,nextEnd+1);
                    console.log(oldLabel);

                    oldLine =  oldLine.replace(oldLabel, '');

                    console.log(oldLine);

                }




                //+1
                newLine += 'xlabel="'+ (nodeCount) + '", ';









                if (nodeCount!=0 && nodeCount != nodeAmount-1){
                    if (cfg[2][nodeCount].astNode.active) {
                        console.log('node count = ' + nodeCount)
                        console.log('node amount =' + nodeAmount)
                        console.log(cfg[2][nodeCount].astNode.active)
                        newLine += 'color="green", ';
                        console.log(escodegen.generate(cfg[2][nodeCount].astNode));


                    }

                    let label = cfg[2][nodeCount].astNode.value;

                    console.log(label);

                    newLine += 'label="'+ label + '", ';

                }






                newLine += 'shape="box", ';
                newLine += oldLine.slice(start + 1);

                nodeCount++;
            }
            else{
                newLine = oldLine;
            }

            //remove exceptions
            if (!newLine.includes('exception')) {
                newGraph += newLine + '\n';
            }

            console.log(newLine);
        }

        console.log(newGraph);

        let svg = david( 'digraph {'  + newGraph + '}');

        //console.log(svg);










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



        $('#parsedCode').html(svg);



    });
});

