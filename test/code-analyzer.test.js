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
            JSON.stringify(table(parseCode('let a = 1;'))),
            '[{"line":1,"type":"VariableDeclarator","name":"a","condition":"","value":1}]'
        );
    });



});

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

//for (var x=0;x<5;x++){
//
// }