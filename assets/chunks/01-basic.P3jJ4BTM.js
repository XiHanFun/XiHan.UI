import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,a as i,b as r,c as o,d as a,e as n}from"./code-view.DWUJummy.js";import"./jsx-runtime.DMocbste.js";import"./theme.UYVbUEgX.js";import"./framework.D1FqHTxE.js";import"./config.DSMADqfW.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.NJJT-7js.js";import"./use-machine.EWI1_r3l.js";import"./index.C5aDBAG5.js";const s=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`;function f(){return e.jsxs(t,{code:s,lang:"typescript",filename:"ticker.ts",complete:!0,style:{inlineSize:"100%"},children:[e.jsxs(i,{children:[e.jsx(r,{}),e.jsx(o,{})]}),e.jsx(a,{children:e.jsx(n,{})})]})}export{f as default};
