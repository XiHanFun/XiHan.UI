import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,d as l,e as r}from"./code-view.DlHsPO_1.js";import"./jsx-runtime.Bely2qbB.js";import"./theme.D_5FEi5w.js";import"./framework.DxrHb2fb.js";import"./config.BqJQ4quc.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.BIG-FA0j.js";import"./use-machine.C3NSZC0e.js";const n=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,m={highlight(o,s){return s!=="yaml"?null:o.split(/(#[^\n]*)/).filter(i=>i!=="").map(i=>({text:i,kind:i.startsWith("#")?"comment":"plain"}))}};function f(){return e.jsxs("div",{style:{display:"grid",gap:"12px"},children:[e.jsx(t,{code:n,lang:"yaml",complete:!0,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:m,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:null,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})})]})}export{f as default};
