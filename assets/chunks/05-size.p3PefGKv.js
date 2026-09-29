import{eD as s,eE as i,eF as l,eG as c,eH as f}from"./theme.CAi6RKG1.js";import{d as u,o,c as r,F as d,B as p,E as e,w as n,k as t,a as x,t as _,h}from"./framework.D1FqHTxE.js";const w={style:{display:"flex","flex-direction":"column",gap:"12px"}},D=`export function clamp(n: number, min: number) {
  return Math.max(n, min)
}`,V=`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`,X=u({__name:"05-size",setup(b){const m=h(()=>f(D,V));return(y,g)=>(o(),r("div",w,[(o(),r(d,null,p(["sm","md","lg"],a=>e(t(c),{key:a,model:m.value,size:a},{default:n(()=>[e(t(s),null,{default:n(()=>[x("src/clamp.ts · "+_(a),1)]),_:2},1024),e(t(i),null,{default:n(()=>[e(t(l))]),_:1})]),_:2},1032,["model","size"])),64))]))}});export{X as default};
