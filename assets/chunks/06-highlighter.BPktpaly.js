import{Lt as e,Zt as t,ft as n,st as r,ut as i,wt as a}from"./framework.eUj94whv.js";import{Eg as o,Mg as s,jg as c}from"./theme.x3bdcchs.js";var l={style:{display:`grid`,gap:`12px`}},u=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,d=n({__name:`06-highlighter`,setup(n){let d={highlight(e,t){return t===`yaml`?e.split(/(#[^\n]*)/).filter(e=>e!==``).map(e=>({text:e,kind:e.startsWith(`#`)?`comment`:`plain`})):null}};return(n,f)=>(a(),r(`div`,l,[i(t(s),{code:u,lang:`yaml`,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[i(t(c),null,{default:e(()=>[i(t(o))]),_:1})]),_:1}),i(t(s),{code:u,lang:`yaml`,complete:``,highlighter:d,style:{"inline-size":`100%`}},{default:e(()=>[i(t(c),null,{default:e(()=>[i(t(o))]),_:1})]),_:1}),i(t(s),{code:u,lang:`yaml`,complete:``,highlighter:null,style:{"inline-size":`100%`}},{default:e(()=>[i(t(c),null,{default:e(()=>[i(t(o))]),_:1})]),_:1})]))}});export{d as default};