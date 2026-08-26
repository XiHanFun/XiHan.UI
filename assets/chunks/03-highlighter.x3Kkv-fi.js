import{X as t}from"./code-block.-H0J99J0.js";import{d as r,o as s,c,E as l,k as n,F as p}from"./framework.CINlqUGR.js";import"./normalize-props.DWkyZsBF.js";import"./normalize-props.C19uE7bg.js";import"./index.D8Afhz82.js";import"./attrs.BPPH_QIK.js";const i=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,k=r({__name:"03-highlighter",setup(h){const m={highlight(a,o){return o!=="yaml"?null:a.split(/(#[^\n]*)/).filter(e=>e!=="").map(e=>({text:e,kind:e.startsWith("#")?"comment":"plain"}))}};return(a,o)=>(s(),c(p,null,[l(n(t),{code:i,lang:"yaml",complete:"",style:{"inline-size":"100%"}}),l(n(t),{code:i,lang:"yaml",complete:"",highlighter:m,style:{"inline-size":"100%"}}),l(n(t),{code:i,lang:"yaml",complete:"",highlighter:null,style:{"inline-size":"100%"}})],64))}});export{k as default};
