import * as esprima from 'esprima';
//import * as david from 'viz.js';

var escodegen = require('escodegen');
var esgraph = require('esgraph');





function colorGraph(splitGraph,cfg){
    let nodeCount = 0;
    let nodeAmount = cfg[2].length;
    let newGraph = '';
    let statement = 0;

    for (let line in splitGraph){
        let newLine;
        let oldLine = splitGraph[line];
        //only change declerations
        if (nodeCount < nodeAmount) {
            let start = oldLine.indexOf('[');
            newLine = oldLine.slice(0, start + 1);

            if (oldLine.includes('BinaryExpression') || oldLine.includes('Literal')){
                //console.log(ifStatements[statement]);
                if (ifStatements[statement]==='true' || ifStatements[statement]==='false') {
                    newLine += 'color="green", ';
                    newLine += 'shape="diamond", ';
                    newLine += 'style="filled" ,';
                }
                statement++;
            }
            else{
                newLine += 'shape="box", ';
            }


            let removeLable = oldLine.indexOf('label=');
            //console.log('labael is on ' + removeLable)
            if (removeLable > 0){
                let ending = oldLine.indexOf('"',removeLable);
                let nextEnd = oldLine.indexOf('"',ending + 1 );

                if (oldLine.slice(nextEnd+1,nextEnd+2) ===',') {
                    //console.log(oldLine.slice(nextEnd + 1, nextEnd + 2));
                    nextEnd += 1;
                }

                let oldLabel = oldLine.slice(removeLable,nextEnd+1);
                //console.log(oldLabel);
                oldLine =  oldLine.replace(oldLabel, '');
                //console.log(oldLine);
            }




            //+1
            newLine += 'xlabel="'+ (nodeCount) + '", ';




            if (nodeCount!=0 && nodeCount != nodeAmount-1){
                if (cfg[2][nodeCount].astNode.active) {

                    newLine += 'color="green", ';
                    newLine += 'style="filled" ,';

                }

                let label = cfg[2][nodeCount].astNode.value;

                //console.log(label);

                newLine += 'label="'+ label + '", ';

            }



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

        //console.log(newLine);
    }

    console.log(newGraph);



    return newGraph;


}

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
    //console.log('changing nodes')
    for (let x in graph){
        let name = thisNode + ' -> n' + from;
        let tmpStr = '';
        if (graph[x].includes(name)){
            //console.log(name)
            //console.log(graph[x] )
            //console.log('change :' + thisNode);
            //console.log('from :' + from);
            //console.log('to: ' + to);
            tmpStr = graph[x].split('[')[0].replace(from,to) + '[' +  graph[x].split('[')[1];
            graph[x]= tmpStr;
        }
    }
}


function fixGraph(graph,n){
    let inputCounter = {};
    //init array
    for (let x = 0; x<n; x++){
        //console.log(x + '=0');
        inputCounter[x]=0;
    }

    //console.log(graph)

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

    //console.log(inputCounter);

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


        //console.log('shifting '+ n)
        graph.splice(n,0, 'n'+n +' [label="null"]')

        addToGraph.push('n'+n + ' -> n' + specialNodes[y] + ' []');

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
                //console.log('match!');
                //console.log(graph[x]);

                let input = parseInt( pre[1].split(' ')[0] );

                //console.log(input);

                console.log('adding null node: id=' + n);
                console.log('assosiatae w/ ' + specialNodes[y]);
                changeNodes(graph, input, specialNodes[y], n);



            }

        }
        n+=1;
    }


    //console.log('adding to graph');
    //console.log((addToGraph))

    graph = graph.concat(addToGraph);

    return graph;
}




const parseCode = (codeToParse) => {
    //console.log('in parse');
    return esprima.parseScript(codeToParse,{loc:true});
};

//let list = [];

let localList = [];

let globalList = [];

//let inFunction = false;

let haveArgs = false;

let globalParams = [];

let ifStatements = [];

let activeRun = true;

let firstNode = true;


function iterateStatements(root){
    for(let i = 0; i < root.body.length; i++){
        if (addStatement(root.body[i])===false){
            let value;
            if (root.body[i].expression){
                value = root.body[i].expression.value;
            }
            else{
                value = root.body[i].value;
            }
            if (root.body[i-1].expression) {
                root.body[i - 1].expression.value += '\n' + value;
            }
            else{
                root.body[i - 1].value += value;
            }
            //remove from list
            root.body.splice(i, 1);
            i--;
        }
    }
    return root;
}



function evalNew(node){
    return escodegen.generate(node);
}


const table = (parsedCode, params)=>{
    localList = []; globalList = []; haveArgs = false; globalParams = [];
    ifStatements = []; firstNode = true;
    activeRun = true;
    if (params[0]) {
        console.log(params)

        if (params[0].expression.expressions) {
            globalParams = params[0].expression.expressions;
        }
        else{
            globalParams = [params[0].expression];
        }
        //haveArgs = true;
        //activeRun = true;
    }
    parsedCode = iterateStatements(parsedCode);
    //console.log(escodegen.generate(parsedCode));
    let cfg = esgraph(parsedCode.body[0].body);
    let graph = esgraph.dot(cfg);
    let splitGraph = graph.toString().split('\n');
    splitGraph.pop();


    //splitGraph.unshift('n13 []');
    let removedExceptions = removeExceptions(splitGraph);
    let fixedGraph = fixGraph(removedExceptions, cfg[2].length);
    splitGraph = fixedGraph;
    let flowGraph = colorGraph(splitGraph,cfg);
    return flowGraph;
};






function addStatement(node){
    const choices = {
        'ExpressionStatement' : addExpression,
        'ReturnStatement' : addReturnStatement,
        'AssignmentExpression' : addAssignmentExpression,
        'VariableDeclaration' : addVariableDeclaration,
        'VariableDeclarator' : addVariableDeclarator,
        'IfStatement' : addIfStatement,
        'FunctionDeclaration' : addFunctionDeclaration,
        'WhileStatement' : addWhileStatement,
        //'ForStatement' : addForStatement,
        'UpdateExpression' : addUpdateExpression,
        'BlockStatement' : iterateStatements
    };
    node.active = activeRun;
    return choices[node.type](node);
}


function getStatement(node){
    //for null init in var declaration. (node.init)
    if (node===null){
        return '';
    }
    const choices = {
        'Literal' : getLiteral,
        'Identifier' : getIdentifier,
        'VariableDeclaration' : getVariableDeclaration,
        'VariableDeclarator' : getVariableDeclarator,
        'SequenceExpression' : getSequenceExpression,
        'getVariableDeclarator' : getMemberExpression,
        'MemberExpression' : getMemberExpression,
        'UnaryExpression' : getUnaryExpression,
        'BinaryExpression' : getBinaryExpression,
        'UpdateExpression' : getUpdateExpression,
        'AssignmentExpression' : getAssignmentExpression
    };
    return choices[node.type](node);
}




function addReturnStatement(node){
    //appendObject(node.loc.start.line,node.type,'','',getStatement(node.argument));
    node.value = 'return ' +  escodegen.generate(node.argument);
    return true;
}


function addAssignmentExpression(node){
    let name;
    if (node.left.type=='MemberExpression'){
        //return getStatement(node.object) + '['+getStatement(node.property)+']';
        name = node.left.object.name + '[' + evalNew(getStatement(node.left.property))+ ']';
    }
    else{
        name = node.left.name;
    }
    node.value = name + '=' + escodegen.generate(node.right);
    let left = name;
    let right = getStatement(node.right);
    //appendObject(node.loc.start.line,node.type,left,'',evalNew(right));
    if (globalList[left]!=null){
        globalList[left] = right;
    }
    else{
        localList[left] = right;
    }
    if (firstNode){
        firstNode = false;
        return true;
    }
    else{
        return false;
    }
}

function addVariableDeclaration(node){

    node.value = '';

    let ans;
    for (let dec in node.declarations){

        ans = addStatement(node.declarations[dec]);
        node.value += node.declarations[dec].value + '\n';

    }



    return ans;
}



function addVariableDeclarator(node){

    node.value = node.id.name + '=' + escodegen.generate(node.init);

    let left = node.id.name;
    let right = getStatement(node.init);

    //node.value = left + '=' + escodegen.generate(node.init);

    localList[left]=right;

    if (firstNode){
        firstNode = false;
        return true;
    }
    else{
        return false;
    }

}

function deepcopy(list){
    let tmpList = {};
    Object.keys(list).forEach(function(key) {
        tmpList[ key ] = list[ key ];
    });
    return tmpList;
}


function addWhileStatement(node){
    //appendObject(node.loc.start.line,node.type,'',getStatement(node.test),'');
    node.test.value = escodegen.generate(node.test);
    firstNode = true;
    let tmpActive = false;
    if (activeRun){
        let test = evalNew(getStatement(node.test));
        for (let num in globalParams) {
            test = test.replace(Object.keys(globalList)[num], evalNew(globalParams[num]));
        }
        if (eval(test) === false) {
            activeRun = false;
            tmpActive = true;
            ifStatements.push('false');
        }
        else{
            ifStatements.push('true');
        }
    }
    else{
        ifStatements.push('notActive');
    }
    iterateStatements(node.body);
    firstNode = true;
    if (tmpActive){
        activeRun = true;
    }
    return true;
}


function addIfStatement(node){
    //node.value = escodegen.generate(node.test);
    node.test.value = escodegen.generate(node.test);
    //let type = node.else ? 'else '+ node.type : node.type;
    //appendObject(node.loc.start.line,type,'',getStatement(node.test),'');
    let test = evalNew(getStatement(node.test));
    for (let num in globalParams) {
        while (test.includes(Object.keys(globalList)[num])) {
            test = test.replace(Object.keys(globalList)[num], evalNew(globalParams[num]));
        }
    }

    let res = 'notActive';
    let tmpReactive = false;
    if (haveArgs && activeRun) {
        if (eval(test) === true) {
            res = 'true';
            node.result = 'true';
        }
        else{
            res = 'false';
            node.result = 'false';
            tmpReactive = true;
            activeRun = false;
        }
    }
    else{
        res = 'notActive';
        node.result = 'notActive';
    }


    ifStatements.push(res);

    firstNode = true;

    let tmpLocalList = deepcopy(localList);
    let tmpGlobalList = deepcopy(globalList);
    addStatement(node.consequent);
    localList = deepcopy(tmpLocalList);
    globalList = deepcopy(tmpGlobalList);



    if (tmpReactive){
        activeRun = true;
    }


    let tmpActive = false;

    if (haveArgs && activeRun){
        if (res==='true'){
            activeRun = false;
            tmpActive = true;
        }
    }


    firstNode = true;

    if (node.alternate){
        if (node.alternate.type==='IfStatement'){
            node.alternate.else=true;
        }
        /*
        else{
            appendObject(node.consequent.loc.end.line+1,'else statement','','','');
        }
        */
        addStatement(node.alternate);
        localList = deepcopy(tmpLocalList);
        globalList = deepcopy(tmpGlobalList);
    }


    if (tmpActive){
        activeRun = true;
    }

    firstNode = true;

    return true;
}

function addFunctionDeclaration(node){
    if (node.params.length ===globalParams.length && node.params.length > 0){

        haveArgs = true;

        for (let param in node.params){
            globalList[node.params[param].name]=getStatement(node.params[param]);
            //appendObject(node.loc.start.line,'VariableDeclarator',getStatement(node.params[param]),'','');
        }

    }
    else{

        activeRun = false;
    }
    //appendObject(node.loc.start.line,node.type,node.id.name,'','');
    //push params

    //all var declerations are local
    //inFunction = true;
    node.body = iterateStatements(node.body);
    return true;
}






/*
function addForStatement(node){
    let condition = getStatement(node.init) +';'+ getStatement(node.test)+';'+getStatement(node.update);
    //appendObject(node.loc.start.line,node.type,'',condition,'');

    for (let statement in node.body.body){
        addStatement(node.body.body[statement]);
    }
}*/

function addExpression(node){

    return  addStatement(node.expression);
}

function addUpdateExpression(node){
    getStatement(node.argument);
    if (node.prefix===false){
        //appendObject(node.loc.start.line,node.type,arg,'',arg + node.operator);
        node.value = escodegen.generate(node.argument) + node.operator;
    }
    else{
        //appendObject(node.loc.start.line,node.type,arg,'',node.operator+arg);
        node.value = node.operator + escodegen.generate(node.argument);
    }

    if (firstNode){
        firstNode = false;
        return true;
    }
    else{
        return false;
    }

}






function getLiteral(node){
    return node;
}

function getIdentifier(node){

    if (localList[node.name]!=null) {
        node = localList[node.name];
    }
    else if (globalList[node.name]!=null){
        node = globalList[node.name];
    }

    return node;
}

function getVariableDeclaration(node){
    let str = '';

    let first = true;

    for (let dec in node.declarations){
        if (first) {
            str += getStatement(node.declarations[dec]);
            first=false;
        }
        else{
            str += ','+getStatement(node.declarations[dec]);
        }
    }
    return str;
}

function getSequenceExpression(node){
    let str = '';

    let first = true;

    for (let exp in node.expressions){
        if (first) {
            str += getStatement(node.expressions[exp]);
            first=false;
        }
        else{
            str += ','+getStatement(node.expressions[exp]);
        }
    }
    return str;
}

function getVariableDeclarator(node){
    return getStatement(node.id) + '=' + getStatement(node.init);
}

function getMemberExpression(node){
    //return getStatement(node.object) + '['+getStatement(node.property)+']';
    return node;
}

function getUnaryExpression(node){
    //return node.operator + getStatement(node.argument);
    return node;
}


function getBinaryExpression(node){
    let left = getStatement(node.left);
    let right = getStatement(node.right);

    node.left = left;
    node.right = right;
    return node;
}

function getUpdateExpression(node){
    if (node.prefix===false){
        return getStatement(node.argument)+node.operator;
    }
    else{
        return node.operator + getStatement(node.argument);
    }

}

function getAssignmentExpression(node){
    return getStatement(node.left) +'='+getStatement(node.right);
}




export {parseCode,table};
