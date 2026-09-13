import{c as l}from"./index.Bj9YYS_y.js";import{fp as m,bq as d,bo as i,bp as u,fo as p}from"./theme.Dk_9lYjD.js";import{d as f,G as _,o as t,b as r,w as o,E as a,k as n,c as h}from"./framework.DkvuVDKz.js";const k=["innerHTML"],b=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,R=f({__name:"03-code-blocks",setup(w){const s=l(),c=_(s.render(b,{ended:!0}));return(x,C)=>(t(),r(n(p),{blocks:c.value,style:{"inline-size":"100%"}},{default:o(()=>[a(n(m),null,{block:o(({block:e})=>[e.kind==="code"?(t(),r(n(d),{key:0,code:e.source??"",lang:e.lang,complete:e.complete,"line-numbers":""},{default:o(()=>[a(n(i),null,{default:o(()=>[a(n(u))]),_:1})]),_:1},8,["code","lang","complete"])):(t(),h("div",{key:1,innerHTML:e.html},null,8,k))]),_:1})]),_:1},8,["blocks"]))}});export{R as default};
