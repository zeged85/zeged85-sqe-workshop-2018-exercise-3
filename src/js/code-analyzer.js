import * as esprima from 'esprima';


const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};

var list = []



function addStatement(node){





    if (node.type==="ExpressionStatement"){
        addStatement(node.expression)
        return;
    }


    if (node.type==="ReturnStatement"){
        var obj = {
            line : node.loc.start.line,
            type : node.type,
            name : "",
            condition : "",
            value : getStatement(node.argument)
        }
        list.push(obj);
        return;
    }



    if (node.type==="AssignmentExpression"){
        var obj = {
            line : node.loc.start.line,
            type : node.type,
            name : getStatement(node.left),
            condition : "",
            value : getStatement(node.right)
        }
        list.push(obj);
        return;
  }


  if (node.type==="VariableDeclaration"){
      for (var dec in node.declarations){
          addStatement(node.declarations[dec])
      }
      return
  }

    if (node.type==="VariableDeclarator"){
        var obj = {
            line : node.loc.start.line,
            type : node.type,
            name : getStatement(node.id),
            condition : "",
            value : getStatement(node.init)
        }
        list.push(obj);
        return;
    }

    if (node.type==="IfStatement"){
        var obj = {
            line : node.loc.start.line,
            type : node.type,
            name : "",
            condition : getStatement(node.test),
            value : ""
        }
        //else if
        if (node.else){
            obj.type = "else " + node.type
        }
        list.push(obj);

        addStatement(node.consequent)
        if (node.alternate){
            if (node.alternate.type==="IfStatement"){
                node.alternate.else=true;
            }
            else{
                var obj = {
                    line : node.consequent.loc.end.line+1,
                    type : "else statement",
                    name : "",
                    condition : "",
                    value : ""
                }
                list.push(obj);
            }

            addStatement(node.alternate)
        }
        return;

    }

if (node.type==="FunctionDeclaration"){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : node.id.name,
        condition : "",
        value : ""
    }
    list.push(obj);

    //push params
    for (var param in node.params){
        var obj = {
            line : node.loc.start.line,
            type : "VariableDeclarator",
            name : getStatement(node.params[param]),
            condition : "",
            value : ""
        }

        list.push(obj);
    }

    //push function body
    for (var statment in node.body.body) {
        addStatement(node.body.body[statment])

    }
   // list.push(obj);

    return
}


if (node.type==="WhileStatement"){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : "",
        condition : getStatement(node.test),
        value : ""
    }
    list.push(obj);
    for (var statement in node.body.body){
        addStatement(node.body.body[statement])
    }
    return;
}

if (node.type==="ForStatement"){
    var obj = {
        line : node.loc.start.line,
        type : node.type,
        name : "",
        condition : getStatement(node.init) +";"+ getStatement(node.test)+";"+getStatement(node.update),
        value : ""
    }

    list.push(obj);
    for (var statement in node.body.body){
        addStatement(node.body.body[statement])
    }
    return;
}


}

function getStatement(node){
    if (node===null){
        return "";
    }

    if (node.type==="Literal"){
        return node.value;
    }
    if (node.type==="Identifier"){
        return node.name;
    }

    if (node.type==="VariableDeclaration"){
        var str = "";

        var first = true;

        for (var dec in node.declarations){
            if (first) {
                str += getStatement(node.declarations[dec])
                first=false
            }
            else{
                str += ","+getStatement(node.declarations[dec])
            }
        }
        return str;
    }


    if (node.type==="SequenceExpression"){
        var str = "";

        var first = true;

        for (var exp in node.expressions){
            if (first) {
                str += getStatement(node.expressions[exp])
                first=false
            }
            else{
                str += ","+getStatement(node.expressions[exp])
            }
        }
        return str;
    }



    if (node.type==="VariableDeclarator"){
        return getStatement(node.id) + "=" + getStatement(node.init)
    }

    if (node.type==="MemberExpression"){
        return getStatement(node.object) + "["+getStatement(node.property)+"]"
    }


    if (node.type==="UnaryExpression"){
        return node.operator + getStatement(node.argument)
    }

    if (node.type==="BinaryExpression"){
        var left = getStatement(node.left)
        var right = getStatement(node.right)

        if (node.operator==='*' || node.operator==='/') {
            if (node.left.type==="BinaryExpression" && (node.left.operator=="+" || node.left.operator=="-")){
                left = "(" + left + ")"
            }
            if (node.right.type==="BinaryExpression" && (node.right.operator=="+" || node.right.operator=="-")){
                right = "(" + right + ")"
            }
        }
        return left + node.operator + right;

    }

if (node.type==="UpdateExpression"){
    if (node.prefix===false){
        return getStatement(node.argument)+node.operator
    }
    else{
        return node.operator + getStatement(node.argument)
    }

}


    if (node.type==="AssignmentExpression"){
        return getStatement(node.left) +"="+getStatement(node.right)
    }


    return "";
}

function analyze(node){

    let str = "line:"+node.loc.start.line+" type:"+node.type+" name:";

    if (node.type==="FunctionDeclaration"){
        str += node.id.name;
    }

    if (node.type==="AssignmentExpression"){
        str +=getToken(node.left) + " value:" + getToken(node.right);
    }

    return str;
}

function morph(node){
    if (node.type===undefined){

    }
    node.type==="Program" ? console.log("program")
        :node.type==="FunctionDeclaration" ? console.log("function: "
        + node.id.name + " params: " + node.params.length)
    :node.type=== "Identifier" ? console.log( node.name)
    :node.type=== "Literal" ? console.log( node.value)
     :node.type==="operator" ? console.log("operator:" )
                :node.type==="VariableDeclaration" ? console.log("VariableDeclaration")
    :node.type==="BlockStatement"  ? console.log("BlockStatement")
                        :node.type==="VariableDeclarator" ? console.log("VariableDeclarator")
                            :node.type==="ExpressionStatement" ? console.log("ExpressionStatement")
        :node.type==="AssignmentExpression" ? console.log("AssignmentExpression")
        : console.log("else:" + node);



    /*
    if (node.type==="Identifier"){
        console.log(node.name)
    }
    if (node.type==="Literal"){
        console.log(node.value)
    }
*/
    //return "else";
}

function analyzeCode(code) {
    var ast = code;
    traverse(ast, function(node) {
        if (node.type === undefined){
          //  console.log("undefined:"+ node)
        }
        else {

           /* console.log(node.type + " line:" + node.loc.start.line +" "
                + node.name + " " + node.value);*/
           /* if (node.id && node.id.name){
                console.log(":" + node.id.name);
            }*/
           // console.log(node.loc)
            console.log(getToken(node))
        }
    });
}


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
                        console.log("->")
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func); //6
                }
            }
        }
    }
}

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
        addStatement(body[line])
    }
}


const table = (parsedCode)=>{

    console.log(parsedCode.type);
    if (parsedCode.type!=="Program"){
        console.log("no program 1st header");
    }
    else{
        console.log("ok");
    }

    console.log("body length:" + parsedCode["body"].length);
    if (parsedCode["body"].length==0){
        console.log("body is empty");
    }

/*
    for (var key in parsedCode["body"]){
        console.log(key +":"+parsedCode["body"][key].type);
        //console.log(key);

    }
    */
    //var globalScope = escope.analyze(parsedCode).scopes[0];


    let title = parsedCode;
    let x=0;
    ///

//analyzeCode(parsedCode);
    iterateStatements(parsedCode);


    for (var statement in list){
        console.log(list[statement])
    }

    //console.log(parsedCode);
    return '';
}








export {parseCode,table};
