import{$t as e,Et as t,ft as n,mt as r,st as i,zt as a}from"./framework.8UxoGp64.js";import{Cg as o,Sg as s,_g as c,bg as l,vg as u,xg as d}from"./theme.CLRs_MM8.js";var f=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,p=r({__name:`01-basic`,setup(r){return(r,p)=>(t(),i(e(o),{code:f,lang:`typescript`,filename:`ticker.ts`,complete:``,style:{"inline-size":`100%`}},{default:a(()=>[n(e(l),null,{default:a(()=>[n(e(u)),n(e(d))]),_:1}),n(e(s),null,{default:a(()=>[n(e(c))]),_:1})]),_:1}))}});export{p as default};