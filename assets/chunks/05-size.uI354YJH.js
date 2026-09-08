import{d3 as s,d4 as i,d5 as l,d6 as c,d7 as d}from"./theme.D9gHp_UI.js";import{d as f,o,c as r,F as u,B as p,E as e,w as n,k as t,a as x,t as _,h}from"./framework.BpF7DVZ1.js";const w={style:{display:"flex","flex-direction":"column",gap:"12px"}},V=`export function clamp(n: number, min: number) {
  return Math.max(n, min)
}`,b=`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`,X=f({__name:"05-size",setup(D){const m=h(()=>d(V,b));return(y,g)=>(o(),r("div",w,[(o(),r(u,null,p(["sm","md","lg"],a=>e(t(c),{key:a,model:m.value,size:a},{default:n(()=>[e(t(s),null,{default:n(()=>[x("src/clamp.ts · "+_(a),1)]),_:2},1024),e(t(i),null,{default:n(()=>[e(t(l))]),_:1})]),_:2},1032,["model","size"])),64))]))}});export{X as default};
