import {  CExp, Exp, isAppExp, isAtomicExp, isCExp, isDefineExp, isExp, isIfExp, isLetExp, isLetPlusExp, isLitExp, isProcExp, isProgram, LetExp, LetPlusExp, makeAppExp, makeDefineExp, makeIfExp, makeLetExp, makeLetPlusExp, makeProcExp, makeProgram, Program } from "./L31-ast";
import { Result, makeOk } from "../shared/result";
import { map, slice, length } from "ramda";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp) ? makeOk(rewriteProgram(exp)) :
    isExp(exp) ? makeOk(rewriteExp(exp)) :
    exp;


const rewriteProgram = (exp: Program): Program =>
    makeProgram(map(rewriteExp, exp.exps));


const rewriteExp = (exp: Exp): Exp =>
    isCExp(exp) ? rewriteCExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var, rewriteCExp(exp.val)) :
    exp;


const rewriteCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(rewriteCExp(exp.test), rewriteCExp(exp.then), rewriteCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteCExp(exp.rator), map(rewriteCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteCExp, exp.body)) :
    isLetExp(exp) ? makeLetExp(exp.bindings, map(rewriteCExp, exp.body)) :
    isLetPlusExp(exp) ? rewriteLetPlus(exp) :
    exp;


const rewriteLetPlus = (exp: LetPlusExp): LetExp | LetPlusExp =>
    (length(exp.bindings) === 1) ? makeLetExp(exp.bindings, map(rewriteCExp, exp.body)) :
    rewriteLetPlus2(exp);
    

const rewriteLetPlus2 = (exp: LetPlusExp): LetExp => {
    const binding = [exp.bindings[0]];
    const restBindings = slice(1, Infinity, exp.bindings);
    const letExpBody = makeLetPlusExp(restBindings, exp.body);
    return makeLetExp(binding, [rewriteLetPlus(letExpBody)]);
}