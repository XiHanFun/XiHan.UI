import{t as e}from"./react.CbNV8_UV.js";import{t}from"./jsx-runtime.CWLBoBiw.js";import{o as n,s as r,t as i}from"./code-view.Dpm1ARMa.js";var a=e(),o=t(),s=`export function createQueue<T>(limit: number) {
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
}`;function c(){let[e,t]=(0,a.useState)([11]);return(0,o.jsxs)(`div`,{style:{display:`grid`,gap:`8px`,inlineSize:`100%`},children:[(0,o.jsx)(r,{code:s,lang:`typescript`,complete:!0,lineNumbers:!0,blockFolding:!0,folded:e,onFoldedChange:e=>t(e.folded),children:(0,o.jsx)(n,{children:(0,o.jsx)(i,{})})}),(0,o.jsx)(`span`,{children:`折叠着的块头：${e.length>0?e.join(`、`):`无`}`})]})}export{c as default};