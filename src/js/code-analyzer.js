import * as esprima from 'esprima';

var escodegen = require('escodegen');





const parseCode = (codeToParse) => {
    console.log('in parse');
    return esprima.parseScript(codeToParse,{loc:true});
};

let list = [];

let localList = [];

let globalList = [];

let inFunction = false;

let haveArgs = false;

let globalParams = [];

let ifStatements = [];

let activeRun = true;

let firstNode = true;


function iterateStatements(root){

    //let body = root.body;

    //var l = root.body.length;
    for(var i = 0; i < root.body.length; i++){
        if (addStatement(root.body[i])===false){
            //append value to first node
            //console.log('appending:')
            //console.log(root.body[i-1].expression)
            //console.log(root.body[i].expression);
            //console.log('root.body[i-1].value = '+ root.body[i-1].expression.value + '+' + root.body[i].expression.value);

            let value;

            if (root.body[i].expression){
                value = root.body[i].expression.value;
            }
            else{
                value = root.body[i].value;
            }

            console.log(value);

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


    list = [];

    localList = [];

    globalList = [];

    inFunction = false;

    haveArgs = false;

    globalParams = [];

    ifStatements = [];

    activeRun = true;



    if (params[0]) {
        globalParams = params[0].expression.expressions;
    }

    ifStatements = [];

    parsedCode = iterateStatements(parsedCode);

    let ans = [];
    for (let statement in list){
        ans.push(list[statement]);
        //console.log(list[statement]);
    }


    list = [];




    return [evalNew(parsedCode), ifStatements];
};





function appendObject(line,type,name,condition,value) {
    const obj = {
        line : line,
        type : type,
        name : name,
        condition : condition,
        value : value
    };
    list.push(obj);
}



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
        'ForStatement' : addForStatement,
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
    //updateVariable(getStatement(node.left),getStatement(node.right));
    //if (node.) is global or local
    //let left = node.left.name;

    node.value = node.left.name + '=' + escodegen.generate(node.right);


    let left = node.left.name;
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

    /*
    if (firstNode){
        firstNode = false;
        return true;
    }
    else{
        return false;
    }
    */

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

    console.log('in while')
    console.log(activeRun);

    let tmpActive = false;

    if (activeRun){
        let test = evalNew(getStatement(node.test));

        for (let num in globalParams) {
            test = test.replace(Object.keys(globalList)[num], evalNew(globalParams[num]));
        }

        console.log(test);



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

    let type = node.else ? 'else '+ node.type : node.type;
    //appendObject(node.loc.start.line,type,'',getStatement(node.test),'');


    let test = evalNew(getStatement(node.test));



    for (let num in globalParams) {
        test = test.replace(Object.keys(globalList)[num], evalNew(globalParams[num]));
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
        else{
            appendObject(node.consequent.loc.end.line+1,'else statement','','','');
        }
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
    if (node.params.length ===globalParams.length){

        haveArgs = true;
    }
    else{

        activeRun = false;
    }
    appendObject(node.loc.start.line,node.type,node.id.name,'','');
    //push params
    for (let param in node.params){
        globalList[node.params[param].name]=getStatement(node.params[param]);
        appendObject(node.loc.start.line,'VariableDeclarator',getStatement(node.params[param]),'','');
    }
    //all var declerations are local
    inFunction = true;
    node.body = iterateStatements(node.body);
    return true;
}







function addForStatement(node){
    let condition = getStatement(node.init) +';'+ getStatement(node.test)+';'+getStatement(node.update);
    appendObject(node.loc.start.line,node.type,'',condition,'');

    for (let statement in node.body.body){
        addStatement(node.body.body[statement]);
    }
}

function addExpression(node){

    return  addStatement(node.expression);
}

function addUpdateExpression(node){
    let arg = getStatement(node.argument);
    if (node.prefix===false){
        //appendObject(node.loc.start.line,node.type,arg,'',arg + node.operator);
        node.value = escodegen.generate(node.argument) + node.operator;
    }
    else{
        //appendObject(node.loc.start.line,node.type,arg,'',node.operator+arg);
        node.value = node.operator + escodegen.generate(node.argument);
    }


/*
    if (localList[arg]!=null){
        return false;
    }
*/


    if (firstNode){
        firstNode = false;
        return true;
    }
    else{
        return false;
    }


    //return true;

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
    return getStatement(node.object) + '['+getStatement(node.property)+']';
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
