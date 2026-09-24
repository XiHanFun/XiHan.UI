import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{e as i,C as a}from"./index.Dvd56iNz.js";import{X as s,d as p,e}from"./clipboard.BJB_iNmv.js";import{X as c,a as n,b as d,d as l,e as h}from"./code-view.DFy5hQVy.js";import{X as o}from"./icon.DNyN-7c1.js";import"./jsx-runtime.BRCQSFi8.js";import"./theme.Dh5psj-1.js";import"./framework.DxrHb2fb.js";import"./config.DFYkkHiw.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./native-events.29TdJGw2.js";import"./react-id.CN2pKJJ-.js";import"./use-machine.BqQ92F7w.js";const t=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,m={"--xh-clipboard-copy-trigger-border":"transparent","--xh-clipboard-copy-trigger-border-hover":"transparent","--xh-clipboard-copy-trigger-bg":"transparent","--xh-clipboard-copy-trigger-h":"var(--xh-control-h-sm)","--xh-clipboard-copy-trigger-px":"var(--xh-control-px-sm)","--xh-clipboard-copy-trigger-font-size":"var(--xh-text-caption-size)"};function z(){return r.jsxs(c,{code:t,lang:"typescript",filename:"store.ts",complete:!0,style:{inlineSize:"100%"},children:[r.jsxs(n,{children:[r.jsx(d,{}),r.jsx(s,{value:t,timeout:1500,style:m,children:r.jsxs(p,{children:[r.jsxs(e,{children:[r.jsx(o,{icon:i})," ","复制"]}),r.jsxs(e,{copied:!0,children:[r.jsx(o,{icon:a})," ","已复制"]})]})})]}),r.jsx(l,{children:r.jsx(h,{})})]})}export{z as default};
