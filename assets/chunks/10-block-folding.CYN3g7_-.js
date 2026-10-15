import{$ as e,Lt as t,Wt as n,Zt as r,ft as i,it as a,st as o,tn as s,ut as c,wt as l}from"./framework.eUj94whv.js";import{Eg as u,Mg as d,jg as f}from"./theme.x3bdcchs.js";var p={"data-demo-output":``},m=`export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}`,h=i({__name:`10-block-folding`,setup(i){let h=n([11]);return(n,i)=>(l(),o(e,null,[c(r(d),{folded:h.value,"onUpdate:folded":i[0]||=e=>h.value=e,code:m,lang:`typescript`,complete:``,"line-numbers":``,"block-folding":``,style:{"inline-size":`100%`}},{default:t(()=>[c(r(f),null,{default:t(()=>[c(r(u))]),_:1})]),_:1},8,[`folded`]),a(`span`,p,`折叠着的块头：`+s(h.value.length>0?h.value.join(`、`):`无`),1)],64))}});export{h as default};