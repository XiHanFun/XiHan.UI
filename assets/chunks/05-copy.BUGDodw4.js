import{Lt as e,Zt as t,at as n,ft as r,lt as i,ut as a,wt as o}from"./framework.eUj94whv.js";import{Vh as s,_ as c,c_ as l,d_ as u,f as d,f_ as f,h_ as p,i_ as m,l_ as h,o_ as g,r_ as _}from"./theme.DPsROaXR.js";var v=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,y=r({__name:`05-copy`,setup(r){return(r,y)=>(o(),n(t(h),{code:v,lang:`typescript`,filename:`store.ts`,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[a(t(g),null,{default:e(()=>[a(t(m)),a(t(p),{value:v,timeout:1500,style:{"--xh-clipboard-copy-trigger-border":`transparent`,"--xh-clipboard-copy-trigger-border-hover":`transparent`,"--xh-clipboard-copy-trigger-bg":`transparent`,"--xh-clipboard-copy-trigger-h":`var(--xh-control-h-sm)`,"--xh-clipboard-copy-trigger-px":`var(--xh-control-px-sm)`,"--xh-clipboard-copy-trigger-font-size":`var(--xh-text-caption-size)`}},{default:e(()=>[a(t(u),null,{default:e(()=>[a(t(f),null,{default:e(()=>[a(t(s),{icon:t(c)},null,8,[`icon`]),y[0]||=i(` 复制`,-1)]),_:1}),a(t(f),{copied:``},{default:e(()=>[a(t(s),{icon:t(d)},null,8,[`icon`]),y[1]||=i(` 已复制`,-1)]),_:1})]),_:1})]),_:1})]),_:1}),a(t(l),null,{default:e(()=>[a(t(_))]),_:1})]),_:1}))}});export{y as default};