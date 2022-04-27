import { map } from 'ramda';
import { Exp, Program, isProgram, isBoolExp, isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isDefineExp, isVarDecl, isBinding, isLetExp, PrimOp, CExp } from '../imp/L3-ast';
import { isSymbolSExp } from '../imp/L3-value';
import { Result, makeFailure, bind, makeOk, mapResult, safe2 } from '../shared/result';


/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? mapResult(l30ToJS, exp.exps):
    isBoolExp(exp) ? makeOk(exp.val? "true" : "false"):
    isNumExp(exp) ? makeOk(exp.val.toString):
    isStrExp(exp) ? makeOk(exp.val) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(primOpToStr(exp.op)) :
    isProcExp(exp) ? bind(l30ToJS(exp.body[0]), body => makeOk("( (" + exp.args.join(", ") + " => (" + body + ") )")) :
    isIfExp(exp) ? safe2((test,althen) => makeOk("((" + test + ")" + althen + ")"))((l30ToJS(exp.test)), safe2((alt, then) => makeOk("?" + alt + " : " + then))(l30ToJS(exp.alt), (l30ToJS(exp.then)))) :
    isDefineExp(exp) ? bind(l30ToJS(exp.val), vl => makeOk("const " + exp.var + " = " + vl)):
    isAppExp(exp) ? isPrimOp(exp.rator)? primOpToJs(exp.rator, exp.rands): safe2((rator: string, rands: string[]) => 
        makeOk(rator + "(" + rands.join(", ") + ")"))(l30ToJS(exp.rator), mapResult(l30ToJS, exp.rands)):
    isLitExp(exp) ? isSymbolSExp(exp.val)? makeOk(`Symbol.for("${exp.val.val}")`):
         makeFailure("Never") : //check
    isLetExp(exp) ?    :
    exp;




    // safe2((varbody: string, vals: string[]) => makeOk(varbody + "(" + vals.join(", ") + ")"))
    // ((safe2((vrs: string[], body: string) => makeOk("( (" + vrs.join(", ") + ")" + "=>" + "(" + body + ")")))
    // (mapResult(l30ToJS, map((b) => b.var, exp.bindings)), l30ToJS(exp.body)), mapResult(l30ToJS, map((b) => b.val, exp.bindings)))

    // safe2((vrs: string[], body: string) => makeOk("( (" + vrs.join(", ") + ")" + "=>" + "(" + body + ")"))
    // (mapResult(l30ToJS, map((b) => b.var, exp.bindings)), l30ToJS(exp.body))

const primOpToStr = (op : string) : string =>
    op === "+" ? op :
    op === "-" ? op :
    op === "*" ? op :
    op === "/" ? op:
    op === "<" ? op:
    op === ">" ? op:
    op === "=" ? "===":
    op === "numer?" ? "( (x) => (typeof (x) === number))":
    op === "boolean?" ? "( (x) => (typeof (x) === boolean))":
    op === "eq?" ? "===":
    op === "and" ? "&&":
    op === "or" ? "||":
    op === "not" ? "not":
    op === "symbol?" ? "( (x) => (typeof (x) === symbol))":
    op === "string?" ? "( (x) => (typeof (x) === string))":
    op === "string=?" ? "===":
    op;

const primOpToJs = (rator: PrimOp, rands: CExp[]) : Result<string> =>
    rator.op === "number?" || rator.op === "boolean?" || rator.op === "symbol?" 
    || rator.op === "string?" ? bind(l30ToJS(rands[0]), (rand: string) => makeOk(primOpToStr(rator.op)+"("+rand+")")) :
    rator.op === "not" ? bind(l30ToJS(rands[0]), (rand: string) => makeOk("(not " + rand + ")")):
    rator.op === "or" ? bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk(rands.join("||"))):
    rator.op === "and" ? bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk(rands.join("&&"))):
    rator.op === "eq?" || rator.op === "string=?" ? bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk("(" + rands.join("===") + ") ?")):
    bind(mapResult(l30ToJS, rands), (rands: string[]) => makeOk("(" + rands.join(" " + primOpToStr(rator.op) + " ") + ")"));



    // isProgram(exp) ?  mapResult(l30ToJS, exp.exps):
    // isBoolExp(exp) ? makeOk(exp.val? "true" : "false") :
    // isNumExp(exp) ?  makeOk("( " + exp.val.toString + " )"):
    // isStrExp(exp) ? makeOk(exp.val) :
    // isLitExp(exp) ?  makeOk("a"):
    // isVarRef(exp) ? makeOk(exp.var) :
    // isVarDecl(exp) ? makeOk("a") :
    // isProcExp(exp) ? bind(l30ToJS(exp.body[0]), body => makeOk("( (" + exp.args.join(", ") + " => (" + body + ") )")) :
    // isIfExp(exp) ? safe2((test,althen) => makeOk("((" + test + ")" + althen + ")"))((l30ToJS(exp.test)), safe2((alt, then) => makeOk("?" + alt + " : " + then))(l30ToJS(exp.alt), (l30ToJS(exp.then)))) :
    // isDefineExp(exp) ? safe2((vr, vl) => makeOk("const " + vr + " = " + vl))((l30ToJS(exp.var)), (l30ToJS(exp.val))) :
    // isBinding(exp) ? safe2((a,b) => makeOk("(" + a + ")" + "(" + b + ")"))(l30ToJS(exp.var), l30ToJS(exp.val)) :
    // isBinding(exp) ? makeOk("a"):
    // isAppExp(exp) ?  makeOk("a"):
    // isPrimOp(exp) ?  makeOk("a"):
    // isLetExp(exp) ?  makeOk("a"):    
    // exp;

