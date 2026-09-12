import{bb as i,bc as n,bd as o}from"./theme.Bj50Izvy.js";import{d as c,o as u,c as h,E as e,w as t,k as l}from"./framework.m090XgxO.js";const p={style:{display:"grid",gap:"12px"}},s=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,y=c({__name:"06-highlighter",setup(_){const m={highlight(r,d){return d!=="yaml"?null:r.split(/(#[^\n]*)/).filter(a=>a!=="").map(a=>({text:a,kind:a.startsWith("#")?"comment":"plain"}))}};return(r,d)=>(u(),h("div",p,[e(l(o),{code:s,lang:"yaml",complete:"",style:{"inline-size":"100%"}},{default:t(()=>[e(l(i),null,{default:t(()=>[e(l(n))]),_:1})]),_:1}),e(l(o),{code:s,lang:"yaml",complete:"",highlighter:m,style:{"inline-size":"100%"}},{default:t(()=>[e(l(i),null,{default:t(()=>[e(l(n))]),_:1})]),_:1}),e(l(o),{code:s,lang:"yaml",complete:"",highlighter:null,style:{"inline-size":"100%"}},{default:t(()=>[e(l(i),null,{default:t(()=>[e(l(n))]),_:1})]),_:1})]))}});export{y as default};
