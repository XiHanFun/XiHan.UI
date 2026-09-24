import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,a as i,b as r,c as o,d as a,e as n}from"./code-view.DFy5hQVy.js";import"./jsx-runtime.BRCQSFi8.js";import"./theme.Dh5psj-1.js";import"./framework.DxrHb2fb.js";import"./config.DFYkkHiw.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.CN2pKJJ-.js";import"./use-machine.BqQ92F7w.js";const s=`export function createTicker(intervalTime: number) {
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
