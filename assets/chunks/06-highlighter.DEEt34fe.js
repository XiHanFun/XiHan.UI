import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,d as l,e as r}from"./code-view.Bh997EBf.js";import"./jsx-runtime.CkCqEvy3.js";import"./theme.VZGDCnnk.js";import"./framework.DxrHb2fb.js";import"./config.BEdeCISN.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.DbVgAgIX.js";import"./use-machine.BCaN6Hs3.js";const n=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,m={highlight(o,s){return s!=="yaml"?null:o.split(/(#[^\n]*)/).filter(i=>i!=="").map(i=>({text:i,kind:i.startsWith("#")?"comment":"plain"}))}};function f(){return e.jsxs("div",{style:{display:"grid",gap:"12px"},children:[e.jsx(t,{code:n,lang:"yaml",complete:!0,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:m,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:null,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})})]})}export{f as default};
