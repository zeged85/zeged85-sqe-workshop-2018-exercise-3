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
            JSON.stringify(table(parseCode('function foo(){let a = 1;}'),parseCode('').body)),
            '\"n0 [xlabel=\\\"0\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn1 [xlabel=\\\"1\\\", label=\\\"a=1\\n\\\", shape=\\\"box\\\", ]\\nn2 [xlabel=\\\"2\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn0 -> n1 []\\nn1 -> n2 []\\n\"'
        );
    });


    it('is parsing a simple variable declaration correctly again', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(){let a = 1;}'),parseCode('').body)),
            '\"n0 [xlabel=\\\"0\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn1 [xlabel=\\\"1\\\", label=\\\"a=1\\n\\\", shape=\\\"box\\\", ]\\nn2 [xlabel=\\\"2\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn0 -> n1 []\\nn1 -> n2 []\\n\"'
        );
    });


/*
    it('is parsing an active flow minimum', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(){let a = 1;}'),parseCode('').body)),
            '\"n0 [xlabel=\\\"0\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn1 [xlabel=\\\"1\\\", label=\\\"a=1\\n\\\", shape=\\\"box\\\", ]\\nn2 [xlabel=\\\"2\\\",shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn0 -> n1 []\\nn1 -> n2 []\\n\"'
        );
    });

*/


    it('is parsing the demo test', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n'),parseCode('').body)),
            '\"n0 [xlabel=\\\"0\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn1 [xlabel=\\\"1\\\", label=\\\"a=x + 1\\nb=a + y\\nc=0\\n\\\", shape=\\\"box\\\", ]\\nn2 [xlabel=\\\"2\\\", label=\\\"b < z\\\", shape=\\\"box\\\", ]\\nn3 [xlabel=\\\"3\\\", label=\\\"c=c + 5\\\", shape=\\\"box\\\", ]\\nn4 [xlabel=\\\"4\\\", label=\\\"return c\\\", shape=\\\"box\\\", ]\\nn5 [xlabel=\\\"5\\\", label=\\\"b < z * 2\\\", shape=\\\"box\\\", ]\\nn6 [xlabel=\\\"6\\\", label=\\\"c=c + x + 5\\\", shape=\\\"box\\\", ]\\nn7 [xlabel=\\\"7\\\", label=\\\"c=c + z + 5\\\", shape=\\\"box\\\", ]\\nn8 [xlabel=\\\"8\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn9 [label=\\\"null\\\"]\\nn0 -> n1 []\\nn1 -> n2 []\\nn2 -> n3 [label=\\\"true\\\"]\\nn2 -> n5 [label=\\\"false\\\"]\\nn3 -> n9 []\\nn4 -> n8 []\\nn5 -> n6 [label=\\\"true\\\"]\\nn5 -> n7 [label=\\\"false\\\"]\\nn6 -> n9 []\\nn7 -> n9 []\\nn9->n4 []\\n\"'
        );
    });



    it('is parsing the demo test with args', () => {
        assert.equal(
            JSON.stringify(table(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n'),parseCode('1,2,3').body)),
            '\"n0 [xlabel=\\\"0\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn1 [xlabel=\\\"1\\\", color=\\\"green\\\", label=\\\"a=x + 1\\nb=a + y\\nc=0\\n\\\", shape=\\\"box\\\", ]\\nn2 [color=\\\"red\\\", xlabel=\\\"2\\\", label=\\\"b < z\\\", shape=\\\"box\\\", ]\\nn3 [xlabel=\\\"3\\\", label=\\\"c=c + 5\\\", shape=\\\"box\\\", ]\\nn4 [xlabel=\\\"4\\\", color=\\\"green\\\", label=\\\"return c\\\", shape=\\\"box\\\", ]\\nn5 [color=\\\"green\\\", xlabel=\\\"5\\\", label=\\\"b < z * 2\\\", shape=\\\"box\\\", ]\\nn6 [xlabel=\\\"6\\\", color=\\\"green\\\", label=\\\"c=c + x + 5\\\", shape=\\\"box\\\", ]\\nn7 [xlabel=\\\"7\\\", label=\\\"c=c + z + 5\\\", shape=\\\"box\\\", ]\\nn8 [xlabel=\\\"8\\\", shape=\\\"box\\\",  style=\\\"rounded\\\"]\\nn9 [label=\\\"null\\\"]\\nn0 -> n1 []\\nn1 -> n2 []\\nn2 -> n3 [label=\\\"true\\\"]\\nn2 -> n5 [label=\\\"false\\\"]\\nn3 -> n9 []\\nn4 -> n8 []\\nn5 -> n6 [label=\\\"true\\\"]\\nn5 -> n7 [label=\\\"false\\\"]\\nn6 -> n9 []\\nn7 -> n9 []\\nn9->n4 []\\n\"'
        );
    });



});


describe('Code-Analyzer - simple statements', () => {

/*
    it('it is analyzing an empty statement correctly', () => {
        assert.equal(
            JSON.stringify(table(parseCode(''),parseCode('').body)),
            '[\"\",[]]'
        );
    });
*/


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





