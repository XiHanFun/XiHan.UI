import{t as e}from"./jsx-runtime.CWLBoBiw.js";import{n as t,o as n,r}from"./clipboard.VtG-8Meh.js";import{i,n as a,o,s,t as c}from"./code-view.Dpm1ARMa.js";import{t as l}from"./icon.C4AxK619.js";import{d as u,g as d}from"./dist.ZGSyedfl.js";var f=e(),p=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,m={"--xh-clipboard-copy-trigger-border":`transparent`,"--xh-clipboard-copy-trigger-border-hover":`transparent`,"--xh-clipboard-copy-trigger-bg":`transparent`,"--xh-clipboard-copy-trigger-h":`var(--xh-control-h-sm)`,"--xh-clipboard-copy-trigger-px":`var(--xh-control-px-sm)`,"--xh-clipboard-copy-trigger-font-size":`var(--xh-text-caption-size)`};function h(){return(0,f.jsxs)(s,{code:p,lang:`typescript`,filename:`store.ts`,complete:!0,style:{inlineSize:`100%`},children:[(0,f.jsxs)(i,{children:[(0,f.jsx)(a,{}),(0,f.jsx)(n,{value:p,timeout:1500,style:m,children:(0,f.jsxs)(t,{children:[(0,f.jsxs)(r,{children:[(0,f.jsx)(l,{icon:d}),` `,`复制`]}),(0,f.jsxs)(r,{copied:!0,children:[(0,f.jsx)(l,{icon:u}),` `,`已复制`]})]})})]}),(0,f.jsx)(o,{children:(0,f.jsx)(c,{})})]})}export{h as default};