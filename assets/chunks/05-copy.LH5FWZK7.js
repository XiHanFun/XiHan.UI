import{Lt as e,Zt as t,at as n,ft as r,lt as i,ut as a,wt as o}from"./framework.eUj94whv.js";import{$g as s,Rh as c,_ as l,a_ as u,c_ as d,d_ as f,e_ as p,f as m,i_ as h,n_ as g,s_ as _}from"./theme.DtyqiN1q.js";var v=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,y=r({__name:`05-copy`,setup(r){return(r,y)=>(o(),n(t(u),{code:v,lang:`typescript`,filename:`store.ts`,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[a(t(g),null,{default:e(()=>[a(t(p)),a(t(f),{value:v,timeout:1500,style:{"--xh-clipboard-copy-trigger-border":`transparent`,"--xh-clipboard-copy-trigger-border-hover":`transparent`,"--xh-clipboard-copy-trigger-bg":`transparent`,"--xh-clipboard-copy-trigger-h":`var(--xh-control-h-sm)`,"--xh-clipboard-copy-trigger-px":`var(--xh-control-px-sm)`,"--xh-clipboard-copy-trigger-font-size":`var(--xh-text-caption-size)`}},{default:e(()=>[a(t(_),null,{default:e(()=>[a(t(d),null,{default:e(()=>[a(t(c),{icon:t(l)},null,8,[`icon`]),y[0]||=i(` 复制`,-1)]),_:1}),a(t(d),{copied:``},{default:e(()=>[a(t(c),{icon:t(m)},null,8,[`icon`]),y[1]||=i(` 已复制`,-1)]),_:1})]),_:1})]),_:1})]),_:1}),a(t(h),null,{default:e(()=>[a(t(s))]),_:1})]),_:1}))}});export{y as default};