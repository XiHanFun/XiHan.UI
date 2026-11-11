import{Lt as e,Zt as t,at as n,ft as r,qt as i,st as a,ut as o,wt as s}from"./framework.eUj94whv.js";import{c_ as c,hl as l,l_ as u,pl as d,r_ as f}from"./theme.aNz4Qjpo.js";import{t as p}from"./dist.DDZh2RUN.js";var m=[`innerHTML`],h=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,g=r({__name:`03-code-blocks`,setup(r){let g=p(),_=i(g.render(h,{ended:!0}));return(r,i)=>(s(),n(t(l),{blocks:_.value,style:{"inline-size":`100%`}},{default:e(()=>[o(t(d),null,{block:e(({block:r})=>[r.kind===`code`?(s(),n(t(u),{key:0,code:r.source??``,lang:r.lang,complete:r.complete,"line-numbers":``},{default:e(()=>[o(t(c),null,{default:e(()=>[o(t(f))]),_:1})]),_:1},8,[`code`,`lang`,`complete`])):(s(),a(`div`,{key:1,innerHTML:r.html},null,8,m))]),_:1})]),_:1},8,[`blocks`]))}});export{g as default};