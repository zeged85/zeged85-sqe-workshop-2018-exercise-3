import * as esprima from 'esprima';

var escodegen = require('escodegen');





const parseCode = (codeToParse) => {
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



function iterateStatements(root){

    //let body = root.body;

    //var l = root.body.length;
    for(var i = 0; i < root.body.length; i++){
        if (addStatement(root.body[i])===false){
            root.body.splice(i, 1);
            i--;
        }
    }
    return root;
}


function addWhileStatement(node){
    appendObject(node.loc.start.line,node.type,'',getStatement(node.test),'');

    iterateStatements(node.body);


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




    for (let ver in localList){
        console.log('local: ' + ver + '='+ evalNew(localList[ver]));
    }

    for (let ver in globalList){
        console.log('global: ' + ver + '='+ evalNew(globalList[ver]));
    }

    list = [];


    console.log('if statements size:' + ifStatements.length)
    for (let x in ifStatements){
        console.log(ifStatements[x]);
    }


    console.log('end product');

    console.log(evalNew(parsedCode))

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
    appendObject(node.loc.start.line,node.type,'','',getStatement(node.argument));
    return true;
}


function addAssignmentExpression(node){
    //updateVariable(getStatement(node.left),getStatement(node.right));
    //if (node.) is global or local
    let left = node.left.name;
    let right = getStatement(node.right);

    appendObject(node.loc.start.line,node.type,left,'',evalNew(right));

    if (!inFunction){

        if (globalList[node.left.name]!=null){
            globalList[node.left.name] = right;
            return true;
        }
        else{
            localList[node.left.name] = right;
        }
        return true;

    }
    else{
        if (localList[node.left.name]!=null){
            localList[node.left.name] = right;
            return false;
        }
        else{
            globalList[node.left.name] = right;
            return true;
        }
    }


}

function addVariableDeclaration(node){
    for (let dec in node.declarations){
        addStatement(node.declarations[dec]);
    }
    return !inFunction;
}

function addVariableDeclarator(node){


    if (inFunction){
        //all variables decleration are local
        //addVariable(getStatement(node.id), getStatement(node.init),'local');
        localList[node.id.name]=getStatement(node.init);

        return false;
    }
    else{
        //global
        //addVariable(getStatement(node.id), getStatement(node.init),'global');

        appendObject(node.loc.start.line,node.type,getStatement(node.id),'',evalNew(getStatement(node.init)));
        globalList[node.id.name]=getStatement(node.init);
    }
    return true;

}

function deepcopy(list){
    let tmpList = {};
    Object.keys(list).forEach(function(key) {
        tmpList[ key ] = list[ key ];
    });
    return tmpList;
}

function addIfStatement(node){
    //check else if
    let type = node.else ? 'else '+ node.type : node.type;
    appendObject(node.loc.start.line,type,'',getStatement(node.test),'');


    let test = evalNew(node.test);



    let globalStr = '';
    for (let num in globalParams) {

        globalStr +=  Object.keys(globalList)[num] + '=' +evalNew(globalParams[num]) + ';\n';
        test = test.replace(Object.keys(globalList)[num], evalNew(globalParams[num]));
    }





    let res = 'notActive';

    if (activeRun) {
        if (eval(test) === true) {
            res = 'true';


        }
        else{
            res = 'false';

        }
    }
    else{

        res = 'notActive';
    }


    ifStatements.push(res)









    let tmpLocalList = deepcopy(localList);
    let tmpGlobalList = deepcopy(globalList);
    addStatement(node.consequent);
    localList = deepcopy(tmpLocalList);
    globalList = deepcopy(tmpGlobalList);


    let tmpActive = false;

    if (haveArgs && activeRun){

        if (res==='true'){

            activeRun = false;
            tmpActive = true;
        }

    }




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
        //addVariable(getStatement(node.params[param]), '','global');
        globalList[node.params[param].name]=getStatement(node.params[param]);
        appendObject(node.loc.start.line,'VariableDeclarator',getStatement(node.params[param]),'','');
    }

    //all var declerations are local
    inFunction = true;



    //push function body

    node.body = iterateStatements(node.body);

    /*
    for (let statement in node.body.body) {
        addStatement(node.body.body[statement]);
    }
    */

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
        appendObject(node.loc.start.line,node.type,arg,'',arg + node.operator);
    }
    else{
        appendObject(node.loc.start.line,node.type,arg,'',node.operator+arg);
    }
    return true;

}






function getLiteral(node){
    return node;
}

function getIdentifier(node){
    let val;
    if (localList[node.name]!=null) {
        node = localList[node.name];
        if (node.type==='Identifier'){
            val = node.name;
        }
        else {
            val = evalNew(node);
        }

    }
    else if (globalList[node.name]!=null){
        node = globalList[node.name];
        if (node.type === 'Identifier'){
            val = node.name;
        }
        else{
            val = evalNew(node);
        }

    }
    else{
        val =  node.name;
    }
    //node.name = val.toString();
    return node;
}

function getVariableDeclaration(node){
    let str = '';

    let first = true;

    for (var dec in node.declarations){
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

function fixBrackets(node){
    return node.type === 'BinaryExpression' && (node.operator === '+' || node.operator === '-');

}

function getBinaryExpression(node){
    let left = getStatement(node.left);
    let right = getStatement(node.right);

    //(1+2)*3
    /*
    if (node.operator==='*' || node.operator==='/') {
        if (fixBrackets(node.left)){
            left = '(' + left + ')';
        }
        if (fixBrackets(node.right)){
            right = '(' + right + ')';
        }
    }
    */
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










const coverage = (table)=>{

    let ans = [];

    let args = [];

    let locals = [];

    for (let row in table){
        if (table[row].type==='FunctionDeclaration'){
            console.log('one function');
        }
        if (table[row].type==='VariableDeclarator'){
            console.log('VariableDeclarator');
            if (table[row].line===1) {
                args.push(table[row]);
            }
            else{
                locals.push(table[row]);
            }
        }

        ans.push(table[row]);
    }
/*
    for (let ver in locals){
        console.log('local: ' + locals[ver].name);
    }
    */

    return ans;

}


export {parseCode,table,coverage};
