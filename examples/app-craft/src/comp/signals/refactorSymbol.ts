import * as esprima from "esprima";
import * as estraverse from "estraverse";
import * as escodegen from "escodegen";
export function refactorSymbol(
    code: string,
    oldSymbol: string,
    newSymbol: string
){
    const ast  = esprima.parseScript(code);
    estraverse.traverse(ast,{
        enter:(node) => {
            if(node.type === 'Identifier' && node.name === oldSymbol){
                node.name = newSymbol;
            }
        }
    })
    return escodegen.generate(ast);
}