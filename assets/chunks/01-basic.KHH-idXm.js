import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,a as i,b as r,c as o,d as a,e as n}from"./code-view.B0vwRE0g.js";import"./jsx-runtime.BldOFNXa.js";import"./theme.DFLq0s3F.js";import"./framework.DxrHb2fb.js";import"./config.BnyuxM-0.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.Dt3j2L6H.js";import"./use-machine.CcwghP7s.js";const s=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`;function X(){return e.jsxs(t,{code:s,lang:"typescript",filename:"ticker.ts",complete:!0,style:{inlineSize:"100%"},children:[e.jsxs(i,{children:[e.jsx(r,{}),e.jsx(o,{})]}),e.jsx(a,{children:e.jsx(n,{})})]})}export{X as default};
