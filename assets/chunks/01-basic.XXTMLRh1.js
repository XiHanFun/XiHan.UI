import{as as n,ar as o,h_ as r,au as i,at as s,av as l}from"./theme.Bzz-Xp1E.js";import{d as c,o as d,b as m,w as t,E as a,k as e}from"./framework.DxrHb2fb.js";const p=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,w=c({__name:"01-basic",setup(u){return(h,_)=>(d(),m(e(l),{code:p,lang:"typescript",filename:"ticker.ts",complete:"",style:{"inline-size":"100%"}},{default:t(()=>[a(e(n),null,{default:t(()=>[a(e(o)),a(e(r))]),_:1}),a(e(i),null,{default:t(()=>[a(e(s))]),_:1})]),_:1}))}});export{w as default};
