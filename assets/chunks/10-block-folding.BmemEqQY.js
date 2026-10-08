import{$t as e,Et as t,Kt as n,ft as r,lt as i,mt as a,ot as o,rn as s,zt as c}from"./framework.8UxoGp64.js";import{_h as l,fh as u,vh as d}from"./theme.89tuodeJ.js";var f={style:{display:`grid`,gap:`8px`,"inline-size":`100%`}},p=`export function createQueue<T>(limit: number) {
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
}`,m=a({__name:`10-block-folding`,setup(a){let m=n([11]);return(n,a)=>(t(),i(`div`,f,[r(e(d),{folded:m.value,"onUpdate:folded":a[0]||=e=>m.value=e,code:p,lang:`typescript`,complete:``,"line-numbers":``,"block-folding":``},{default:c(()=>[r(e(l),null,{default:c(()=>[r(e(u))]),_:1})]),_:1},8,[`folded`]),o(`span`,null,`折叠着的块头：`+s(m.value.length>0?m.value.join(`、`):`无`),1)]))}});export{m as default};