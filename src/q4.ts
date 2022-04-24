import { map } from 'ramda';
import { Exp, Program, isProgram, isBoolExp, isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isDefineExp, isVarDecl, isBinding, isLetExp } from '../imp/L3-ast';
import { Result, makeFailure, bind, makeOk, mapResult, safe2 } from '../shared/result';

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ?  mapResult(l30ToJS, exp.exps):
    isBoolExp(exp) ? makeOk(exp.val? "true" : "false") :
    isNumExp(exp) ?  makeOk("( " + exp.val.toString + " )"):
    isStrExp(exp) ? makeOk(exp.val) :
    //isLitExp(exp) ?  makeOk():
    isVarRef(exp) ? makeOk(exp.var) :
    //isVarDecl(exp) ?  :
    isProcExp(exp) ? bind(l30ToJS(exp.body[0]), body => makeOk("( (" + exp.args.join(", ") + " => (" + body + ") )")) :
    isIfExp(exp) ?  :
    isBinding(exp) ? :
    isAppExp(exp) ?  :
    isPrimOp(exp) ?  :
    isLetExp(exp) ?  :
    isDefineExp(exp) ?  :
    exp;

const lambdaToStr = (exp: Exp): string => 
        












// Add a quote for symbols, empty and compound sexp - strings and numbers are not quoted.
const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` :
    isSymbolSExp(le.val) ? `'${valueToString(le.val)}` :
    isCompoundSExp(le.val) ? `'${valueToString(le.val)}` :
    `${le.val}`;

const unparseLExps = (les: Exp[]): string =>
    map(unparseL3, les).join(" ");

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda (${map((p: VarDecl) => p.var, pe.args).join(" ")}) ${unparseLExps(pe.body)})`

const unparseLetExp = (le: LetExp) : string => 
    `(let (${map((b: Binding) => `(${b.var.var} ${unparseL3(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`

export const unparseL3 = (exp: Program | Exp): string =>
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isStrExp(exp) ? valueToString(exp.val) :
    isLitExp(exp) ? unparseLitExp(exp) :
    isVarRef(exp) ? exp.var :
    isProcExp(exp) ? unparseProcExp(exp) :
    isIfExp(exp) ? `(if ${unparseL3(exp.test)} ${unparseL3(exp.then)} ${unparseL3(exp.alt)})` :
    isAppExp(exp) ? `(${unparseL3(exp.rator)} ${unparseLExps(exp.rands)})` :
    isPrimOp(exp) ? exp.op :
    isLetExp(exp) ? unparseLetExp(exp) :
    isDefineExp(exp) ? `(define ${exp.var.var} ${unparseL3(exp.val)})` :
    isProgram(exp) ? `(L3 ${unparseLExps(exp.exps)})` :
    exp;    