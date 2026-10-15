import{$ as e,Et as t,Lt as n,Zt as r,ft as i,lt as a,rt as o,st as s,tn as c,ut as l,wt as u}from"./framework.eUj94whv.js";import{cp as d,dD as f,fp as p,lp as m,sp as h}from"./theme.x3bdcchs.js";var g={style:{display:`flex`,"flex-direction":`column`,gap:`12px`}},_=`export function clamp(n: number, min: number) {
  return Math.max(n, min)
}`,v=`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`,y=i({__name:`05-size`,setup(i){let y=o(()=>f(_,v));return(i,o)=>(u(),s(`div`,g,[(u(),s(e,null,t([`sm`,`md`,`lg`],e=>l(r(m),{key:e,model:y.value,size:e},{default:n(()=>[l(r(d),null,{default:n(()=>[a(`src/clamp.ts · `+c(e),1)]),_:2},1024),l(r(p),null,{default:n(()=>[l(r(h))]),_:1})]),_:2},1032,[`model`,`size`])),64))]))}});export{y as default};