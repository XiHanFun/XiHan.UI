import{_ as e,f as t}from"./theme.CZaS8O1o.js";import{t as n}from"./jsx-runtime.CWLBoBiw.js";import{n as r,o as i,r as a}from"./clipboard.BEPPGkrt.js";import{i as o,n as s,o as c,s as l,t as u}from"./code-view.eciLGIw6.js";import{t as d}from"./icon.pCZVaBv5.js";var f=n(),p=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,m={"--xh-clipboard-copy-trigger-border":`transparent`,"--xh-clipboard-copy-trigger-border-hover":`transparent`,"--xh-clipboard-copy-trigger-bg":`transparent`,"--xh-clipboard-copy-trigger-h":`var(--xh-control-h-sm)`,"--xh-clipboard-copy-trigger-px":`var(--xh-control-px-sm)`,"--xh-clipboard-copy-trigger-font-size":`var(--xh-text-caption-size)`};function h(){return(0,f.jsxs)(l,{code:p,lang:`typescript`,filename:`store.ts`,complete:!0,style:{inlineSize:`100%`},children:[(0,f.jsxs)(o,{children:[(0,f.jsx)(s,{}),(0,f.jsx)(i,{value:p,timeout:1500,style:m,children:(0,f.jsxs)(r,{children:[(0,f.jsxs)(a,{children:[(0,f.jsx)(d,{icon:e}),` `,`复制`]}),(0,f.jsxs)(a,{copied:!0,children:[(0,f.jsx)(d,{icon:t}),` `,`已复制`]})]})})]}),(0,f.jsx)(c,{children:(0,f.jsx)(u,{})})]})}export{h as default};