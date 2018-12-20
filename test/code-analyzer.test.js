import assert from 'assert';
import {parseCode,table} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'

        );
    });


    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode('let a = 1;'),parseCode('').body)),
            '["let a = 1;",[]]'
        );
    });



});


describe('Code-Analyzer - simple statements', () => {

    /*
    it('it is analyzing an empty statement correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode(''))),
            '[]'
        );
    });
*/

    it('it is analyzing a full function correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n    if (x > 0) {\n        x = y + 5;\n    } \n}\n'),parseCode('1,2,3').body)),
            '[\"function foo(x, y, z) {\\n    if (x > 0) {\\n        x = y + 5;\\n    }\\n}\",[\"true\"]]'
        );
    });


/*
    it('it is analyzing an unary expression correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode('x=-3', []))),
            '[{"line":1,"type":"AssignmentExpression","name":"x","condition":"","value":"-3"}]'
        );
    });

*/

});



/*

    describe('Code-Analyzer - math expressions', () => {

        it('it is analyzing math brackets correctly', () => {
            assert.equal(
                JSON.stringify(table(parseCode('x=(3+5)/(2-4);'))),
                '[{"line":1,"type":"AssignmentExpression","name":"x","condition":"","value":"(3+5)/(2-4)"}]'
            );
        });

    });


    describe('Code-Analyzer - AssignmentExpressions', () => {
        it('it is analyzing multiple AssignmentExpressions correctly', () => {
            assert.equal(
                JSON.stringify(table(parseCode('x=3;y=6+i;'))),
                '[{"line":1,"type":"AssignmentExpression","name":"x","condition":"","value":3},{"line":1,"type":"AssignmentExpression","name":"y","condition":"","value":"6+i"}]'
            );
        });

        it('it is analyzing multiple VariableDeclarator correcrly', () => {
            assert.equal(
                JSON.stringify(table(parseCode('let x=3*5+6;y=(6+i)*4;'))),
                '[{"line":1,"type":"VariableDeclarator","name":"x","condition":"","value":"3*5+6"},{"line":1,"type":"AssignmentExpression","name":"y","condition":"","value":"(6+i)*4"}]'
            );
        });

    });




    describe('Code-Analyzer - functions', () =>{
        it('it is testing function', () => {
            assert.equal(
                JSON.stringify(table(parseCode('function Search(){\n++x;\n}'))),
                '[{"line":1,"type":"FunctionDeclaration","name":"Search","condition":"","value":""},{"line":2,"type":"UpdateExpression","name":"x","condition":"","value":"++x"}]'
            );
        });


        it('it is testing function return', () => {
            assert.equal(
                JSON.stringify(table(parseCode('function binarySearch(X, V, n){\nreturn x[5];\n}'))),
                '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"X","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"V","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"n","condition":"","value":""},{"line":2,"type":"ReturnStatement","name":"","condition":"","value":"x[5]"}]'
            );
        });

    });


    describe('Code-Analyzer - if statements', () => {

        it('it is testing a simple if statement', () => {
            assert.equal(
                JSON.stringify(table(parseCode('if (x===true){\nx=false;\n}'))),
                '[{"line":1,"type":"IfStatement","name":"","condition":"x===true","value":""},{"line":2,"type":"AssignmentExpression","name":"x","condition":"","value":false}]'
            );
        });

        it('it is testing if elseif else', () => {
            assert.equal(
                JSON.stringify(table(parseCode('if (X < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nmid=3;'))),
                '[{"line":1,"type":"IfStatement","name":"","condition":"X<V[mid]","value":""},{"line":2,"type":"AssignmentExpression","name":"high","condition":"","value":"mid-1"},{"line":3,"type":"else IfStatement","name":"","condition":"X>V[mid]","value":""},{"line":4,"type":"AssignmentExpression","name":"low","condition":"","value":"mid+1"},{"line":5,"type":"else statement","name":"","condition":"","value":""},{"line":6,"type":"AssignmentExpression","name":"mid","condition":"","value":3}]'
            );
        });
    });


    describe('Code-Analyzer - for loops', () => {
        it('it is testing a simple for loop', () => {
            assert.equal(
                JSON.stringify(table(parseCode('for (var x=3, y=2; y<=5; x++){\nx=1;\n}'))),
                '[{"line":1,"type":"ForStatement","name":"","condition":"x=3,y=2;y<=5;x++","value":""},{"line":2,"type":"AssignmentExpression","name":"x","condition":"","value":1}]'
            );
        });


        it('it is testing a loop w/ sequence and unaryexpression statement', () => {
            assert.equal(
                JSON.stringify(table(parseCode('for (x=3, y=2; y!=5; --x){\nx++;\n}'))),
                '[{"line":1,"type":"ForStatement","name":"","condition":"x=3,y=2;y!=5;--x","value":""},{"line":2,"type":"UpdateExpression","name":"x","condition":"","value":"x++"}]'
            );
        });

    });




    describe('Code-Analyzer - while loops', () => {
        it('it is testing a simple while loop', () => {
            assert.equal(
                JSON.stringify(table(parseCode('while (low <= high) {\nmid = (low + high)/2;\n}'))),
                '[{"line":1,"type":"WhileStatement","name":"","condition":"low<=high","value":""},{"line":2,"type":"AssignmentExpression","name":"mid","condition":"","value":"(low+high)/2"}]'
            );
        });
    });


    describe('Code-Analyzer - large scripts', () => {
        it('it is testing the full demo script', () => {
            assert.equal(
                JSON.stringify(table(parseCode('function binarySearch(X, V, n){\nlet low, high, mid;\nlow = 0;\nhigh = n - 1;\nwhile (low <= high) {\nmid = (low + high)/2;\nif (X < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nreturn mid;\n}\nreturn -1;\n}'))),
                '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"X","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"V","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"n","condition":"","value":""},{"line":2,"type":"VariableDeclarator","name":"low","condition":"","value":""},{"line":2,"type":"VariableDeclarator","name":"high","condition":"","value":""},{"line":2,"type":"VariableDeclarator","name":"mid","condition":"","value":""},{"line":3,"type":"AssignmentExpression","name":"low","condition":"","value":0},{"line":4,"type":"AssignmentExpression","name":"high","condition":"","value":"n-1"},{"line":5,"type":"WhileStatement","name":"","condition":"low<=high","value":""},{"line":6,"type":"AssignmentExpression","name":"mid","condition":"","value":"(low+high)/2"},{"line":7,"type":"IfStatement","name":"","condition":"X<V[mid]","value":""},{"line":8,"type":"AssignmentExpression","name":"high","condition":"","value":"mid-1"},{"line":9,"type":"else IfStatement","name":"","condition":"X>V[mid]","value":""},{"line":10,"type":"AssignmentExpression","name":"low","condition":"","value":"mid+1"},{"line":11,"type":"else statement","name":"","condition":"","value":""},{"line":12,"type":"ReturnStatement","name":"","condition":"","value":"mid"},{"line":14,"type":"ReturnStatement","name":"","condition":"","value":"-1"}]'
            );
        });
    });



    */


    /*
    describe('Code-Analyzer2', () =>{
        it('it is testing 2', () => {
            assert.equal(
                JSON.stringify(table(parseCode('function binarySearch(X, V, n){\nlet low, high, mid;\nlow = 0;\nhigh = n - 1;\nwhile (low <= high) {\nmid = (low + high)/2;\nif (X < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nreturn mid;\n}\nreturn -1;\n}'))),
                '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"X","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"V","condition":"","value":""},{"line":1,"type":"VariableDeclarator","name":"n","condition":"","value":""},{"line":2,"type":"VariableDeclarator","name":"low","condition":"",value":""},{"line":2,"type":"VariableDeclarator","name":"high","condition":"","value":""},{"line":2,"type":"VariableDeclarator","name":"mid","condition":"","value":""},{"line":3,"type":"AssignmentExpression","name":"low","condition":"","value":0},{"line":4,"type":"AssignmentExpression","name":"high","condition":"","value":"n-1"},{"line":5,"type":"WhileStatement","name":"","condition":"low<=high","value":""},{"line":6,"type":"AssignmentExpression","name":"mid","condition":"","value":"(low+high)/2"},{"line":7,"type":"IfStatement","name":"","condition":"X<V[mid]","value":""},{"line":8,"type":"AssignmentExpression","name":"high","condition":"","value":"mid-1"},{"line":9,"type":"else IfStatement","name":"","condition":"X>V[mid]","value":""},{"line":10,"type":"AssignmentExpression","name":"low","condition":"","value":"mid+1"},{"line":11,"type":"else statement","name":"","condition":"","value":""},{"line":12,"type":"ReturnStatement","name":"","condition":"","value":"mid"},{"line":14,"type":"ReturnStatement","name":"","condition":"","value":"-1"}]'
            );
        });

    });
    */


    /*
    it('is parsing multiple variable declarations correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode('let a = 1, b=2;'))),
            '[{"line":1,"type":"VariableDeclarator","name":"a","condition":"","value":1},{"line":1,"type":"VariableDeclarator","name":"b","condition":"","value":2}]'
        );
    });
    */


    /*
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
    */

