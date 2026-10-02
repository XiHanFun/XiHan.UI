import{bK as n,bL as o,bM as r,bN as i,bO as l,bP as s}from"./theme.3wlaQcnM.js";import{d as c,o as d,b as m,w as t,E as a,k as e}from"./framework.D1FqHTxE.js";const p=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,C=c({__name:"01-basic",setup(u){return(f,h)=>(d(),m(e(s),{code:p,lang:"typescript",filename:"ticker.ts",complete:"",style:{"inline-size":"100%"}},{default:t(()=>[a(e(n),null,{default:t(()=>[a(e(o)),a(e(r))]),_:1}),a(e(i),null,{default:t(()=>[a(e(l))]),_:1})]),_:1}))}});export{C as default};
