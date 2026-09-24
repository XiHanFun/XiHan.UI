import{c as l}from"./index.Bj9YYS_y.js";import{db as m,av as d,au as i,at as u,dc as p}from"./theme.Bzz-Xp1E.js";import{d as _,G as f,o as a,b as r,w as t,E as o,k as n,c as h}from"./framework.DxrHb2fb.js";const k=["innerHTML"],w=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,R=_({__name:"03-code-blocks",setup(b){const s=l(),c=f(s.render(w,{ended:!0}));return(x,C)=>(a(),r(n(p),{blocks:c.value,style:{"inline-size":"100%"}},{default:t(()=>[o(n(m),null,{block:t(({block:e})=>[e.kind==="code"?(a(),r(n(d),{key:0,code:e.source??"",lang:e.lang,complete:e.complete,"line-numbers":""},{default:t(()=>[o(n(i),null,{default:t(()=>[o(n(u))]),_:1})]),_:1},8,["code","lang","complete"])):(a(),h("div",{key:1,innerHTML:e.html},null,8,k))]),_:1})]),_:1},8,["blocks"]))}});export{R as default};
