import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{d as i,C as a}from"./index.Hc5X0IOq.js";import{X as s,d as p,e}from"./clipboard.DKTKUcJ4.js";import{X as c,a as n,b as d,d as l,e as h}from"./code-view.EGh17UCn.js";import{X as o}from"./icon.Dvy-SdUi.js";import"./jsx-runtime.WmPRW3nq.js";import"./theme.C7zwwLoT.js";import"./framework.DkvuVDKz.js";import"./config.zjQNv5ZK.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./native-events.29TdJGw2.js";import"./react-id.BxIHEzVx.js";import"./use-machine.DNJB6l4c.js";const t=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,m={"--xh-clipboard-copy-trigger-border":"transparent","--xh-clipboard-copy-trigger-border-hover":"transparent","--xh-clipboard-copy-trigger-bg":"transparent","--xh-clipboard-copy-trigger-h":"var(--xh-control-h-sm)","--xh-clipboard-copy-trigger-px":"var(--xh-control-px-sm)","--xh-clipboard-copy-trigger-font-size":"var(--xh-text-caption-size)"};function z(){return r.jsxs(c,{code:t,lang:"typescript",filename:"store.ts",complete:!0,style:{inlineSize:"100%"},children:[r.jsxs(n,{children:[r.jsx(d,{}),r.jsx(s,{value:t,timeout:1500,style:m,children:r.jsxs(p,{children:[r.jsxs(e,{children:[r.jsx(o,{icon:i})," ","复制"]}),r.jsxs(e,{copied:!0,children:[r.jsx(o,{icon:a})," ","已复制"]})]})})]}),r.jsx(l,{children:r.jsx(h,{})})]})}export{z as default};
