import{$t as e,Et as t,dt as n,ft as r,mt as i,st as a,zt as o}from"./framework.8UxoGp64.js";import{_h as s,bh as c,fh as l,hh as u,ph as d,uu as f,vh as p,wh as m,xh as h}from"./theme.89tuodeJ.js";import{d as g,g as _}from"./dist.ZGSyedfl.js";var v=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,y=i({__name:`05-copy`,setup(i){return(i,y)=>(t(),a(e(p),{code:v,lang:`typescript`,filename:`store.ts`,complete:``,style:{"inline-size":`100%`}},{default:o(()=>[r(e(u),null,{default:o(()=>[r(e(d)),r(e(m),{value:v,timeout:1500,style:{"--xh-clipboard-copy-trigger-border":`transparent`,"--xh-clipboard-copy-trigger-border-hover":`transparent`,"--xh-clipboard-copy-trigger-bg":`transparent`,"--xh-clipboard-copy-trigger-h":`var(--xh-control-h-sm)`,"--xh-clipboard-copy-trigger-px":`var(--xh-control-px-sm)`,"--xh-clipboard-copy-trigger-font-size":`var(--xh-text-caption-size)`}},{default:o(()=>[r(e(c),null,{default:o(()=>[r(e(h),null,{default:o(()=>[r(e(f),{icon:e(_)},null,8,[`icon`]),y[0]||=n(` 复制`,-1)]),_:1}),r(e(h),{copied:``},{default:o(()=>[r(e(f),{icon:e(g)},null,8,[`icon`]),y[1]||=n(` 已复制`,-1)]),_:1})]),_:1})]),_:1})]),_:1}),r(e(s),null,{default:o(()=>[r(e(l))]),_:1})]),_:1}))}});export{y as default};