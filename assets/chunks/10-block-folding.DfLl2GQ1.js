import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as o,d as r,e as d}from"./code-view.JA8rOgvz.js";import{r as p}from"./index.Cgwy3NI6.js";import"./jsx-runtime.Twf82CZ0.js";import"./theme.BkMxTDZM.js";import"./framework.D1FqHTxE.js";import"./config.BlN2qURc.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.DkmMrr56.js";import"./use-machine.8B9a6DMY.js";import"./index.C5aDBAG5.js";const s=`export function createQueue<T>(limit: number) {
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
}`;function T(){const[i,t]=p.useState([11]);return e.jsxs("div",{style:{display:"grid",gap:"8px",inlineSize:"100%"},children:[e.jsx(o,{code:s,lang:"typescript",complete:!0,lineNumbers:!0,blockFolding:!0,folded:i,onFoldedChange:n=>t(n.folded),children:e.jsx(r,{children:e.jsx(d,{})})}),e.jsx("span",{children:`折叠着的块头：${i.length>0?i.join("、"):"无"}`})]})}export{T as default};
