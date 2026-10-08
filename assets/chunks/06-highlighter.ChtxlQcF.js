import{t as e}from"./jsx-runtime.CWLBoBiw.js";import{o as t,s as n,t as r}from"./code-view.Dpm1ARMa.js";var i=e(),a=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,o={highlight(e,t){return t===`yaml`?e.split(/(#[^\n]*)/).filter(e=>e!==``).map(e=>({text:e,kind:e.startsWith(`#`)?`comment`:`plain`})):null}};function s(){return(0,i.jsxs)(`div`,{style:{display:`grid`,gap:`12px`},children:[(0,i.jsx)(n,{code:a,lang:`yaml`,complete:!0,style:{inlineSize:`100%`},children:(0,i.jsx)(t,{children:(0,i.jsx)(r,{})})}),(0,i.jsx)(n,{code:a,lang:`yaml`,complete:!0,highlighter:o,style:{inlineSize:`100%`},children:(0,i.jsx)(t,{children:(0,i.jsx)(r,{})})}),(0,i.jsx)(n,{code:a,lang:`yaml`,complete:!0,highlighter:null,style:{inlineSize:`100%`},children:(0,i.jsx)(t,{children:(0,i.jsx)(r,{})})})]})}export{s as default};