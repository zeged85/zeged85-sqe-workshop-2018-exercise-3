import * as esprima from 'esprima';


const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};

var list = [];

function addReturnStatement(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : '',
        condition : '',
        value : getStatement(node.argument)
    };
    list.push(obj);
}


function addAssignmentExpression(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : getStatement(node.left),
        condition : '',
        value : getStatement(node.right)
    };
    list.push(obj);
}

function addVariableDeclaration(node){
    for (let dec in node.declarations){
        addStatement(node.declarations[dec]);
    }
}

function addVariableDeclarator(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : getStatement(node.id),
        condition : '',
        value : getStatement(node.init)
    };
    list.push(obj);
}

function addIfStatement(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : '',
        condition : getStatement(node.test),
        value : ''
    };
    //else if
    if (node.else){
        obj.type = 'else ' + node.type;
    }
    list.push(obj);

    addStatement(node.consequent);
    if (node.alternate){
        if (node.alternate.type==='IfStatement'){
            node.alternate.else=true;
        }
        else{
            var obj = {
                line : node.consequent.loc.end.line+1,
                type : 'else statement',
                name : '',
                condition : '',
                value : ''
            };
            list.push(obj);
        }

        addStatement(node.alternate);
    }
}

function addFunctionDeclaration(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : node.id.name,
        condition : '',
        value : ''
    };
    list.push(obj);

    //push params
    for (var param in node.params){
        var obj = {
            line : node.loc.start.line,
            type : 'VariableDeclarator',
            name : getStatement(node.params[param]),
            condition : '',
            value : ''
        };

        list.push(obj);
    }

    //push function body
    for (var statment in node.body.body) {
        addStatement(node.body.body[statment]);

    }

}

function addWhileStatement(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : '',
        condition : getStatement(node.test),
        value : ''
    };
    list.push(obj);
    for (var statement in node.body.body){
        addStatement(node.body.body[statement]);
    }
}


function addForStatement(node){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : '',
        condition : getStatement(node.init) +';'+ getStatement(node.test)+';'+getStatement(node.update),
        value : ''
    };

    list.push(obj);
    for (var statement in node.body.body){
        addStatement(node.body.body[statement]);
    }
}


function addStatement(node){

    if (node.type==='ExpressionStatement'){
        addStatement(node.expression);
        return;
    }


    if (node.type==='ReturnStatement'){
        addReturnStatement(node);
        return;
    }



    if (node.type==='AssignmentExpression'){
        addAssignmentExpression(node);
        return;
    }


    if (node.type==='VariableDeclaration'){
        addVariableDeclaration(node);
        return;
    }

    if (node.type==='VariableDeclarator'){

        addVariableDeclarator(node);
        return;
    }

    if (node.type==='IfStatement'){
        addIfStatement(node);
        return;
    }

    if (node.type==='FunctionDeclaration'){
        addFunctionDeclaration(node);
        return;
    }


    if (node.type==='WhileStatement'){
        addWhileStatement(node);
        return;
    }

    if (node.type==='ForStatement'){
        addForStatement(node);
        return;
    }


}

function getLiteral(node){
    return node.value;
}

function getIdentifier(node){
    return node.name;
}

function getVariableDeclaration(node){
    var str = '';

    var first = true;

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
    var str = '';

    var first = true;

    for (var exp in node.expressions){
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
    return node.operator + getStatement(node.argument);
}

function getBinaryExpression(node){
    var left = getStatement(node.left);
    var right = getStatement(node.right);

    if (node.operator==='*' || node.operator==='/') {
        if (node.left.type==='BinaryExpression' && (node.left.operator=='+' || node.left.operator=='-')){
            left = '(' + left + ')';
        }
        if (node.right.type==='BinaryExpression' && (node.right.operator=='+' || node.right.operator=='-')){
            right = '(' + right + ')';
        }
    }
    return left + node.operator + right;

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

function getStatement(node){

    if (node.type==='Literal'){
        return getLiteral(node);
    }
    if (node.type==='Identifier'){
        return getIdentifier(node);
    }

    if (node.type==='VariableDeclaration'){
        return getVariableDeclaration(node);
    }


    if (node.type==='SequenceExpression'){
        return getSequenceExpression(node);
    }


    if (node.type==='VariableDeclarator'){
        return getVariableDeclarator(node);
    }

    if (node.type==='MemberExpression'){
        return getMemberExpression(node);
    }

    if (node.type==='UnaryExpression'){
        return getUnaryExpression(node);
    }

    if (node.type==='BinaryExpression'){
        return getBinaryExpression(node);
    }

    if (node.type==='UpdateExpression'){
        return getUpdateExpression(node);
    }

    if (node.type==='AssignmentExpression'){
        return getAssignmentExpression(node);
    }


    return '';
}


/*
function morph(node){
    if (node.type===undefined){

    }
    node.type==='Program' ? console.log('program')
        :node.type==='FunctionDeclaration' ? console.log('function: '
        + node.id.name + ' params: ' + node.params.length)
            :node.type=== 'Identifier' ? console.log( node.name)
                :node.type=== 'Literal' ? console.log( node.value)
                    :node.type==='operator' ? console.log('operator:' )
                        :node.type==='VariableDeclaration' ? console.log('VariableDeclaration')
                            :node.type==='BlockStatement'  ? console.log('BlockStatement')
                                :node.type==='VariableDeclarator' ? console.log('VariableDeclarator')
                                    :node.type==='ExpressionStatement' ? console.log('ExpressionStatement')
                                        :node.type==='AssignmentExpression' ? console.log('AssignmentExpression')
                                            : console.log('else:' + node);




    if (node.type==="Identifier"){
        console.log(node.name)
    }
    if (node.type==="Literal"){
        console.log(node.value)
    }

    return "else";
}*/

/*
function analyzeCode(code) {
    var ast = code;
    traverse(ast, function(node) {
        if (node.type === undefined){
            //  console.log("undefined:"+ node)
        }
        else {


            // console.log(node.loc)
            console.log(getToken(node));
        }
    });
}*/

/*
function traverse(node, func) {
    if (node.type !== undefined){
        func(node);//1

        //console.log(node.loc)
    }

    for (var key in node) { //2
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];
            if (typeof child === 'object' && child !== null) { //4

                if (Array.isArray(child)) {
                    child.forEach(function(node) { //5
                        console.log('->');
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func); //6
                }
            }
        }
    }
}*/

///enums?
/*

Identifier->Name
Literal->Value

VariableDeclaration->declarations


FunctionDeclaration


ExpressionStatement
VariableDeclaration

WhileStatement
If
else
return

for


 */

function iterateStatements(root){

    let body = root.body;
    for (let line in body){
        addStatement(body[line]);
    }
}


const table = (parsedCode)=>{


    iterateStatements(parsedCode);

    var ans = [];
    for (var statement in list){
        ans.push(list[statement]);
    }

    //console.log(parsedCode);
    return ans;
};








export {parseCode,table};
