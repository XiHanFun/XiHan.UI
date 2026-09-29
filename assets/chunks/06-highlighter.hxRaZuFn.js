import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{X as t,d as l,e as r}from"./code-view.CE0-EHZ6.js";import"./jsx-runtime.BcTJLmfc.js";import"./theme.BUzG0yHg.js";import"./framework.D1FqHTxE.js";import"./config.D1IAGChV.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.G53GIPms.js";import"./use-machine.DwQJK_3b.js";import"./index.C5aDBAG5.js";const n=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,m={highlight(o,s){return s!=="yaml"?null:o.split(/(#[^\n]*)/).filter(i=>i!=="").map(i=>({text:i,kind:i.startsWith("#")?"comment":"plain"}))}};function C(){return e.jsxs("div",{style:{display:"grid",gap:"12px"},children:[e.jsx(t,{code:n,lang:"yaml",complete:!0,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:m,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})}),e.jsx(t,{code:n,lang:"yaml",complete:!0,highlighter:null,style:{inlineSize:"100%"},children:e.jsx(l,{children:e.jsx(r,{})})})]})}export{C as default};
