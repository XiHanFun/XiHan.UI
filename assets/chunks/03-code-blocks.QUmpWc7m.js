import{c as l}from"./index.Bj9YYS_y.js";import{fe as m,bd as d,bb as i,bc as u,fd as p}from"./theme.CzGOHWR9.js";import{d as f,G as _,o,b as r,w as t,E as a,k as n,c as h}from"./framework.m090XgxO.js";const b=["innerHTML"],k=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,R=f({__name:"03-code-blocks",setup(w){const s=l(),c=_(s.render(k,{ended:!0}));return(x,C)=>(o(),r(n(p),{blocks:c.value,style:{"inline-size":"100%"}},{default:t(()=>[a(n(m),null,{block:t(({block:e})=>[e.kind==="code"?(o(),r(n(d),{key:0,code:e.source??"",lang:e.lang,complete:e.complete,"line-numbers":""},{default:t(()=>[a(n(i),null,{default:t(()=>[a(n(u))]),_:1})]),_:1},8,["code","lang","complete"])):(o(),h("div",{key:1,innerHTML:e.html},null,8,b))]),_:1})]),_:1},8,["blocks"]))}});export{R as default};
