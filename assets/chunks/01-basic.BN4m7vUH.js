import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,a as i,b as r,c as o,d as a,e as n}from"./code-view.ByFc3fpA.js";import"./normalize-props.BHQTd-S8.js";import"./theme.CivESN_z.js";import"./framework.D1FqHTxE.js";import"./config.m0IiGLfc.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./react-id.DPv7M-sg.js";import"./use-machine.BKyDWuxn.js";import"./index.DEmbwZee.js";const s=`export function createTicker(intervalTime: number) {
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
