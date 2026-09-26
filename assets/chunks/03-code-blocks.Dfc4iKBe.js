import{c as l}from"./index.Bj9YYS_y.js";import{dc as d,aw as m,av as i,au as u,dd as p}from"./theme.C6dHip5i.js";import{d as _,G as f,o as a,b as r,w as t,E as o,k as n,c as h}from"./framework.DxrHb2fb.js";const k=["innerHTML"],w=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,R=_({__name:"03-code-blocks",setup(x){const s=l(),c=f(s.render(w,{ended:!0}));return(C,b)=>(a(),r(n(p),{blocks:c.value,style:{"inline-size":"100%"}},{default:t(()=>[o(n(d),null,{block:t(({block:e})=>[e.kind==="code"?(a(),r(n(m),{key:0,code:e.source??"",lang:e.lang,complete:e.complete,"line-numbers":""},{default:t(()=>[o(n(i),null,{default:t(()=>[o(n(u))]),_:1})]),_:1},8,["code","lang","complete"])):(a(),h("div",{key:1,innerHTML:e.html},null,8,k))]),_:1})]),_:1},8,["blocks"]))}});export{R as default};
