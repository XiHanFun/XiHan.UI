import{$t as e,Et as t,ft as n,lt as r,mt as i,zt as a}from"./framework.8UxoGp64.js";import{Cg as o,Sg as s,_g as c}from"./theme.CZaS8O1o.js";var l={style:{display:`grid`,gap:`12px`}},u=`# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`,d=i({__name:`06-highlighter`,setup(i){let d={highlight(e,t){return t===`yaml`?e.split(/(#[^\n]*)/).filter(e=>e!==``).map(e=>({text:e,kind:e.startsWith(`#`)?`comment`:`plain`})):null}};return(i,f)=>(t(),r(`div`,l,[n(e(o),{code:u,lang:`yaml`,complete:``,style:{"inline-size":`100%`}},{default:a(()=>[n(e(s),null,{default:a(()=>[n(e(c))]),_:1})]),_:1}),n(e(o),{code:u,lang:`yaml`,complete:``,highlighter:d,style:{"inline-size":`100%`}},{default:a(()=>[n(e(s),null,{default:a(()=>[n(e(c))]),_:1})]),_:1}),n(e(o),{code:u,lang:`yaml`,complete:``,highlighter:null,style:{"inline-size":`100%`}},{default:a(()=>[n(e(s),null,{default:a(()=>[n(e(c))]),_:1})]),_:1})]))}});export{d as default};