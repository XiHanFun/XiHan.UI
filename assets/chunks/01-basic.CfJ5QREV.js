import{X as e}from"./code-block.KZuC6O2N.js";import{d as t,o as r,b as o,k as n}from"./framework.CyyS6Zdm.js";import"./normalize-props.DWkyZsBF.js";import"./normalize-props.C19uE7bg.js";import"./index.DVKxZwlK.js";import"./attrs.BPPH_QIK.js";const a=`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`,f=t({__name:"01-basic",setup(i){return(c,s)=>(r(),o(n(e),{code:a,lang:"typescript",complete:"",style:{"inline-size":"100%"}}))}});export{f as default};
