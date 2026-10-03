import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{c as i,C as a}from"./index.DfnbpvFp.js";import{X as s,d as p,e}from"./clipboard.CdcPqUJY.js";import{X as c,a as n,b as d,d as l,e as h}from"./code-view.D1MeBPxF.js";import{X as o}from"./icon.V4l0ToXV.js";import"./normalize-props.Xhi2Ok_z.js";import"./theme.Ddq9Fhix.js";import"./framework.D1FqHTxE.js";import"./config._yqfA1yn.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./native-events.Wj-y_d0k.js";import"./react-id.R0XbvH8S.js";import"./use-machine.BiEqyKiZ.js";import"./index.DEmbwZee.js";const t=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,m={"--xh-clipboard-copy-trigger-border":"transparent","--xh-clipboard-copy-trigger-border-hover":"transparent","--xh-clipboard-copy-trigger-bg":"transparent","--xh-clipboard-copy-trigger-h":"var(--xh-control-h-sm)","--xh-clipboard-copy-trigger-px":"var(--xh-control-px-sm)","--xh-clipboard-copy-trigger-font-size":"var(--xh-text-caption-size)"};function S(){return r.jsxs(c,{code:t,lang:"typescript",filename:"store.ts",complete:!0,style:{inlineSize:"100%"},children:[r.jsxs(n,{children:[r.jsx(d,{}),r.jsx(s,{value:t,timeout:1500,style:m,children:r.jsxs(p,{children:[r.jsxs(e,{children:[r.jsx(o,{icon:i})," ","复制"]}),r.jsxs(e,{copied:!0,children:[r.jsx(o,{icon:a})," ","已复制"]})]})})]}),r.jsx(l,{children:r.jsx(h,{})})]})}export{S as default};
