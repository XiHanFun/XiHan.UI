import{$t as e,Et as t,dt as n,ft as r,mt as i,st as a,zt as o}from"./framework.8UxoGp64.js";import{Cg as s,Eg as c,Sg as l,Tg as u,_ as d,_g as f,bg as p,f as m,hd as h,kg as g,vg as _}from"./theme.CZaS8O1o.js";var v=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,y=i({__name:`05-copy`,setup(i){return(i,y)=>(t(),a(e(s),{code:v,lang:`typescript`,filename:`store.ts`,complete:``,style:{"inline-size":`100%`}},{default:o(()=>[r(e(p),null,{default:o(()=>[r(e(_)),r(e(g),{value:v,timeout:1500,style:{"--xh-clipboard-copy-trigger-border":`transparent`,"--xh-clipboard-copy-trigger-border-hover":`transparent`,"--xh-clipboard-copy-trigger-bg":`transparent`,"--xh-clipboard-copy-trigger-h":`var(--xh-control-h-sm)`,"--xh-clipboard-copy-trigger-px":`var(--xh-control-px-sm)`,"--xh-clipboard-copy-trigger-font-size":`var(--xh-text-caption-size)`}},{default:o(()=>[r(e(u),null,{default:o(()=>[r(e(c),null,{default:o(()=>[r(e(h),{icon:e(d)},null,8,[`icon`]),y[0]||=n(` 复制`,-1)]),_:1}),r(e(c),{copied:``},{default:o(()=>[r(e(h),{icon:e(m)},null,8,[`icon`]),y[1]||=n(` 已复制`,-1)]),_:1})]),_:1})]),_:1})]),_:1}),r(e(l),null,{default:o(()=>[r(e(f))]),_:1})]),_:1}))}});export{y as default};