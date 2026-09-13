import{c as l}from"./index.Bj9YYS_y.js";import{fr as m,bq as d,bo as i,bp as u,fq as p}from"./theme.C7zwwLoT.js";import{d as f,G as _,o,b as a,w as t,E as r,k as n,c as h}from"./framework.DkvuVDKz.js";const k=["innerHTML"],b=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,R=f({__name:"03-code-blocks",setup(w){const s=l(),c=_(s.render(b,{ended:!0}));return(x,C)=>(o(),a(n(p),{blocks:c.value,style:{"inline-size":"100%"}},{default:t(()=>[r(n(m),null,{block:t(({block:e})=>[e.kind==="code"?(o(),a(n(d),{key:0,code:e.source??"",lang:e.lang,complete:e.complete,"line-numbers":""},{default:t(()=>[r(n(i),null,{default:t(()=>[r(n(u))]),_:1})]),_:1},8,["code","lang","complete"])):(o(),h("div",{key:1,innerHTML:e.html},null,8,k))]),_:1})]),_:1},8,["blocks"]))}});export{R as default};
