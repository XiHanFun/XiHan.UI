import{$t as e,Et as t,ft as n,mt as r,st as i,zt as a}from"./framework.8UxoGp64.js";import{_h as o,fh as s,gh as c,hh as l,ph as u,vh as d}from"./theme.89tuodeJ.js";var f=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,p=r({__name:`01-basic`,setup(r){return(r,p)=>(t(),i(e(d),{code:f,lang:`typescript`,filename:`ticker.ts`,complete:``,style:{"inline-size":`100%`}},{default:a(()=>[n(e(l),null,{default:a(()=>[n(e(u)),n(e(c))]),_:1}),n(e(o),null,{default:a(()=>[n(e(s))]),_:1})]),_:1}))}});export{p as default};