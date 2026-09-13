import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,d as l,e as r}from"./code-view.DgifboSE.js";import"./jsx-runtime.PWAf6Kuf.js";import"./theme.o20Ye0K_.js";import"./framework.DkvuVDKz.js";import"./config.BUbJZZG1.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.DkWBcU0a.js";const n=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,m={highlight(o,s){return s!=="yaml"?null:o.split(/(#[^\n]*)/).filter(i=>i!=="").map(i=>({text:i,kind:i.startsWith("#")?"comment":"plain"}))}};function y(){return e.jsxs("div",{style:{display:"grid",gap:"12px"},children:[e.jsx(t,{code:n,lang:"yaml",complete:!0,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:m,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:null,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})})]})}export{y as default};
