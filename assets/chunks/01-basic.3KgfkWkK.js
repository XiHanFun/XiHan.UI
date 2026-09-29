import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,a as i,b as r,c as o,d as a,e as n}from"./code-view.JA8rOgvz.js";import"./jsx-runtime.Twf82CZ0.js";import"./theme.BkMxTDZM.js";import"./framework.D1FqHTxE.js";import"./config.BlN2qURc.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.DkmMrr56.js";import"./use-machine.8B9a6DMY.js";import"./index.C5aDBAG5.js";const s=`export function createTicker(intervalTime: number) {
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
