import{Lt as e,Zt as t,at as n,ft as r,ut as i,wt as a}from"./framework.eUj94whv.js";import{c_ as o,i_ as s,l_ as c,o_ as l,r_ as u,s_ as d}from"./theme.Cyv0rDCL.js";var f=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,p=r({__name:`01-basic`,setup(r){return(r,p)=>(a(),n(t(c),{code:f,lang:`typescript`,filename:`ticker.ts`,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[i(t(l),null,{default:e(()=>[i(t(s)),i(t(d))]),_:1}),i(t(o),null,{default:e(()=>[i(t(u))]),_:1})]),_:1}))}});export{p as default};