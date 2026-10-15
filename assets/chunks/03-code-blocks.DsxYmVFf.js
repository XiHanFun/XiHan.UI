import{Lt as e,Zt as t,at as n,ft as r,qt as i,st as a,ut as o,wt as s}from"./framework.eUj94whv.js";import{Eg as c,Mg as l,cu as u,jg as d,ou as f}from"./theme.x3bdcchs.js";import{t as p}from"./dist.DDZh2RUN.js";var m=[`innerHTML`],h=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,g=r({__name:`03-code-blocks`,setup(r){let g=p(),_=i(g.render(h,{ended:!0}));return(r,i)=>(s(),n(t(u),{blocks:_.value,style:{"inline-size":`100%`}},{default:e(()=>[o(t(f),null,{block:e(({block:r})=>[r.kind===`code`?(s(),n(t(l),{key:0,code:r.source??``,lang:r.lang,complete:r.complete,"line-numbers":``},{default:e(()=>[o(t(d),null,{default:e(()=>[o(t(c))]),_:1})]),_:1},8,[`code`,`lang`,`complete`])):(s(),a(`div`,{key:1,innerHTML:r.html},null,8,m))]),_:1})]),_:1},8,[`blocks`]))}});export{g as default};