import{at as n,as as o,i6 as i,av as r,au as s,aw as l}from"./theme.C6dHip5i.js";import{d as c,o as d,b as m,w as t,E as a,k as e}from"./framework.DxrHb2fb.js";const p=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,C=c({__name:"01-basic",setup(u){return(f,h)=>(d(),m(e(l),{code:p,lang:"typescript",filename:"ticker.ts",complete:"",style:{"inline-size":"100%"}},{default:t(()=>[a(e(n),null,{default:t(()=>[a(e(o)),a(e(i))]),_:1}),a(e(r),null,{default:t(()=>[a(e(s))]),_:1})]),_:1}))}});export{C as default};
