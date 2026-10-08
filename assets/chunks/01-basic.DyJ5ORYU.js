import{t as e}from"./jsx-runtime.CWLBoBiw.js";import{a as t,i as n,n as r,o as i,s as a,t as o}from"./code-view.Dpm1ARMa.js";var s=e(),c=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`;function l(){return(0,s.jsxs)(a,{code:c,lang:`typescript`,filename:`ticker.ts`,complete:!0,style:{inlineSize:`100%`},children:[(0,s.jsxs)(n,{children:[(0,s.jsx)(r,{}),(0,s.jsx)(t,{})]}),(0,s.jsx)(i,{children:(0,s.jsx)(o,{})})]})}export{l as default};