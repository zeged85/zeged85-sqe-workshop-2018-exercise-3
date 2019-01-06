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


    it('it is analyzing an empty statement correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode(''),parseCode('').body)),
            '[\"\",[]]'
        );
    });

/*
    it('it is analyzing a full function correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n    if (x > 0) {\n        x = y + 5;\n    } \n}\n'),parseCode('1,2,3').body)),
            '[\"function foo(x, y, z) {\\n    if (x > 0) {\\n        x = y + 5;\\n    }\\n}\",[\"true\"]]'
        );
    });



    it('it is analyzing a while statement correctly 2', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n    let c = 0;\n    \n    while (a < z) {\n        c = a + b;\n        z = c * 2;\n    }\n    \n    return z;\n}\n'),parseCode('').body)),
            '[\"function foo(x, y, z) {\\n    while (x + 1 < z) {\\n        z = (x + 1 + (x + 1 + y)) * 2;\\n    }\\n    return z;\\n}\",[]]'
        );
    });



    it('it is analyzing a full function correctly 2', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n    let c = 0;\n    \n    if (b < z) {\n        c = c + 5;\n        return x + y + z + c;\n    } \n}'),parseCode('1,2,3').body)),
            '[\"function foo(x, y, z) {\\n    if (x + 1 + y < z) {\\n        return x + y + z + (0 + 5);\\n    }\\n}\",[\"false\"]]'
        );
    });




    it('it is analyzing a example1', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n    let c = 0;\n    \n    if (b < z) {\n        c = c + 5;\n        return x + y + z + c;\n    } else if (b < z * 2) {\n        c = c + x + 5;\n        return x + y + z + c;\n    } else {\n        c = c + z + 5;\n        return x + y + z + c;\n    }\n}\n'),parseCode('').body)),
            '[\"function foo(x, y, z) {\\n    if (x + 1 + y < z) {\\n        return x + y + z + (0 + 5);\\n    } else if (x + 1 + y < z * 2) {\\n        return x + y + z + (0 + x + 5);\\n    } else {\\n        return x + y + z + (0 + z + 5);\\n    }\\n}\",[\"notActive\",\"notActive\"]]'
        );
    });



    it('it is analyzing a array test', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n    let c = 0;\n    \n    while (a < z) {\n     y = x[0]\n    }\n    \n    return y;\n}\n'),parseCode('[1,2,3],2,3').body)),
            '[\"function foo(x, y, z) {\\n    while (x + 1 < z) {\\n        y = x[0];\\n    }\\n    return y;\\n}\",[]]'
        );
    });



    it('it is analyzing various', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x,y){\n    let a = x;\n\n    if (true) {\n     y = a[2]++;\n    }\n    return y;\n}\n'),parseCode('[true,\'hello\',0],2').body)),
            '[\"function foo(x, y) {\\n    if (true) {\\n        y = a[2]++;\\n    }\\n    return y;\\n}\",[\"true\"]]'
        );
    });



    it('it is analyzing an array statement correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x,y){\n    let a = x;\n\n    if (true) {\n     x[0] = x[2]++;\n    }\n    return y;\n}\n'),parseCode('[1,2,3],2').body)),
            '[\"function foo(x, y) {\\n    if (true) {\\n        x[0] = x[2]++;\\n    }\\n    return y;\\n}\",[\"true\"]]'
        );
    });

*/
});





