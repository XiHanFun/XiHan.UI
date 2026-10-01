import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as o,d as r,e as d}from"./code-view.DCZ5_iYY.js";import{r as p}from"./index.Cgwy3NI6.js";import"./normalize-props.7WH3JZ55.js";import"./theme.CJ9j62Hs.js";import"./framework.D1FqHTxE.js";import"./config.CYFUMMQf.js";import"./slot-content.BDi8aYdV.js";import"./react-id.B8WQbd3H.js";import"./use-machine.DBXrlEJi.js";import"./index.DEmbwZee.js";const s=`export function createQueue<T>(limit: number) {
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
}`;function w(){const[i,t]=p.useState([11]);return e.jsxs("div",{style:{display:"grid",gap:"8px",inlineSize:"100%"},children:[e.jsx(o,{code:s,lang:"typescript",complete:!0,lineNumbers:!0,blockFolding:!0,folded:i,onFoldedChange:n=>t(n.folded),children:e.jsx(r,{children:e.jsx(d,{})})}),e.jsx("span",{children:`折叠着的块头：${i.length>0?i.join("、"):"无"}`})]})}export{w as default};
