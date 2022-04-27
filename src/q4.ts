import { map } from 'ramda';
import { Exp, Program, isProgram, isBoolExp, isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isDefineExp, isVarDecl, isBinding, isLetExp, PrimOp, CExp, LetExp, isCompoundExp } from '../imp/L3-ast';
import { compoundSExpToString, isSymbolSExp } from '../imp/L3-value';
import { Result, makeFailure, bind, makeOk, mapResult, safe2 } from '../shared/result';



/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? bind(mapResult(l30ToJS, exp.exps), exps => makeOk(exps.join(";\n"))) :
    isBoolExp(exp) ? makeOk(exp.val? "true" : "false"):
    isNumExp(exp) ? makeOk(exp.val.toString()):
    isStrExp(exp) ? makeOk(`\"${exp.val}\"`) : //check
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(primOpToStr(exp.op)) :
    isProcExp(exp) ? bind(l30ToJS(exp.body[0]), body => makeOk("((" + map((b) => b.var, exp.args).join(",") + ") => " + body + ")")) :
    isIfExp(exp) ? safe2((test,althen) => makeOk("(" + test + althen + ")"))((l30ToJS(exp.test)), safe2((then, alt) => makeOk(" ? " + then + " : " + alt))(l30ToJS(exp.then), (l30ToJS(exp.alt)))) :
    isLetExp(exp) ? letToJS(exp) :
    isDefineExp(exp) ? bind(l30ToJS(exp.val), vl => makeOk("const " + exp.var.var + " = " + vl)):
    isAppExp(exp) ? isPrimOp(exp.rator)? primOpToJs(exp.rator, exp.rands): safe2((rator: string, rands: string[]) => 
         makeOk(rator + "(" + rands.join(",") + ")"))(l30ToJS(exp.rator), mapResult(l30ToJS, exp.rands)):
    isLitExp(exp) ? isSymbolSExp(exp.val)? makeOk(`Symbol.for("${exp.val.val}")`):
          makeFailure("Never") : //check
    makeFailure("never");

const letToJS = (exp: LetExp) : Result<string> => {
    const vars = map((b) => b.var.var, exp.bindings);
    const vals = map((b) => b.val, exp.bindings);

    return safe2((varbody: string, vals: string[]) => makeOk(varbody + "(" + vals.join(",") + ")"))
    (bind(l30ToJS(exp.body[0]), (body:string) => makeOk("((" + vars.join(",") + ") => " + body + ")")),mapResult(l30ToJS, vals))    
}


const primOpToStr = (op : string) : string =>
    op === "+" ? op :
    op === "-" ? op :
    op === "*" ? op :
    op === "/" ? op:
    op === "<" ? op:
    op === ">" ? op:
    op === "=" ? "===":
    op === "numer?" ? "((x) => (typeof (x) === number))":
    op === "boolean?" ? "((x) => (typeof (x) === boolean))":
    op === "eq?" ? "===":
    op === "and" ? "&&":
    op === "or" ? "||":
    op === "not" ? "!":
    op === "symbol?" ? "((x) => (typeof (x) === symbol))":
    op === "string?" ? "((x) => (typeof (x) === string))":
    op === "string=?" ? "===":
    op;


const primOpToJs = (rator: PrimOp, rands: CExp[]) : Result<string> =>
    rator.op === "number?" || rator.op === "boolean?" || rator.op === "symbol?" 
    || rator.op === "string?" ? bind(l30ToJS(rands[0]), (rand: string) => makeOk(primOpToStr(rator.op)+"("+rand+")")) :
    rator.op === "not" ? bind(l30ToJS(rands[0]), (rand: string) => makeOk("(!" + rand + ")")):
    rator.op === "or" ? bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk(rands.join("||"))):
    rator.op === "and" ? bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk(rands.join("&&"))):
    rator.op === "eq?" || rator.op === "string=?" ? bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk("(" + rands.join(" === ") + ")")):
    bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk("(" + rands.join(" " + primOpToStr(rator.op) + " ") + ")"));


