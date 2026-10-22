import{Lt as e,Zt as t,at as n,ft as r,ut as i,wt as a}from"./framework.eUj94whv.js";import{$g as o,a_ as s,e_ as c,i_ as l,n_ as u,r_ as d}from"./theme.VO-fEBmc.js";var f=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,p=r({__name:`01-basic`,setup(r){return(r,p)=>(a(),n(t(s),{code:f,lang:`typescript`,filename:`ticker.ts`,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[i(t(u),null,{default:e(()=>[i(t(c)),i(t(d))]),_:1}),i(t(l),null,{default:e(()=>[i(t(o))]),_:1})]),_:1}))}});export{p as default};