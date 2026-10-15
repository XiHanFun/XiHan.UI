import{t as e}from"./jsx-runtime.CoN_kYeJ.js";import{t}from"./react.CbNV8_UV.js";import{o as n,s as r,t as i}from"./code-view.CKeccAz9.js";var a=t(),o=e(),s=`export function createQueue<T>(limit: number) {
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
}`;function c(){let[e,t]=(0,a.useState)([11]);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(r,{code:s,lang:`typescript`,complete:!0,lineNumbers:!0,blockFolding:!0,folded:e,onFoldedChange:e=>t(e.folded),style:{inlineSize:`100%`},children:(0,o.jsx)(n,{children:(0,o.jsx)(i,{})})}),(0,o.jsx)(`span`,{"data-demo-output":!0,children:`折叠着的块头：${e.length>0?e.join(`、`):`无`}`})]})}export{c as default};