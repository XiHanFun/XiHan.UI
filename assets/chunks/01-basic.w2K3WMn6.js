import{Lt as e,Zt as t,at as n,ft as r,ut as i,wt as a}from"./framework.eUj94whv.js";import{Ag as o,Dg as s,Eg as c,Mg as l,jg as u,kg as d}from"./theme.x3bdcchs.js";var f=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,p=r({__name:`01-basic`,setup(r){return(r,p)=>(a(),n(t(l),{code:f,lang:`typescript`,filename:`ticker.ts`,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[i(t(d),null,{default:e(()=>[i(t(s)),i(t(o))]),_:1}),i(t(u),null,{default:e(()=>[i(t(c))]),_:1})]),_:1}))}});export{p as default};