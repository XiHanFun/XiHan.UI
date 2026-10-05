import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,d as l,e as r}from"./code-view.ByFc3fpA.js";import"./normalize-props.BHQTd-S8.js";import"./theme.CivESN_z.js";import"./framework.D1FqHTxE.js";import"./config.m0IiGLfc.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./react-id.DPv7M-sg.js";import"./use-machine.BKyDWuxn.js";import"./index.DEmbwZee.js";const n=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,m={highlight(o,s){return s!=="yaml"?null:o.split(/(#[^\n]*)/).filter(i=>i!=="").map(i=>({text:i,kind:i.startsWith("#")?"comment":"plain"}))}};function C(){return e.jsxs("div",{style:{display:"grid",gap:"12px"},children:[e.jsx(t,{code:n,lang:"yaml",complete:!0,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:m,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:null,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})})]})}export{C as default};
