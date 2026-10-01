import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{c as i,C as a}from"./index.DfnbpvFp.js";import{X as s,d as p,e}from"./clipboard.BVm2Ah70.js";import{X as c,a as n,b as d,d as l,e as h}from"./code-view.DCZ5_iYY.js";import{X as o}from"./icon.DKxJiEE4.js";import"./normalize-props.7WH3JZ55.js";import"./theme.CJ9j62Hs.js";import"./framework.D1FqHTxE.js";import"./config.CYFUMMQf.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./native-events.Wj-y_d0k.js";import"./react-id.B8WQbd3H.js";import"./use-machine.DBXrlEJi.js";import"./index.DEmbwZee.js";const t=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,m={"--xh-clipboard-copy-trigger-border":"transparent","--xh-clipboard-copy-trigger-border-hover":"transparent","--xh-clipboard-copy-trigger-bg":"transparent","--xh-clipboard-copy-trigger-h":"var(--xh-control-h-sm)","--xh-clipboard-copy-trigger-px":"var(--xh-control-px-sm)","--xh-clipboard-copy-trigger-font-size":"var(--xh-text-caption-size)"};function S(){return r.jsxs(c,{code:t,lang:"typescript",filename:"store.ts",complete:!0,style:{inlineSize:"100%"},children:[r.jsxs(n,{children:[r.jsx(d,{}),r.jsx(s,{value:t,timeout:1500,style:m,children:r.jsxs(p,{children:[r.jsxs(e,{children:[r.jsx(o,{icon:i})," ","复制"]}),r.jsxs(e,{copied:!0,children:[r.jsx(o,{icon:a})," ","已复制"]})]})})]}),r.jsx(l,{children:r.jsx(h,{})})]})}export{S as default};
