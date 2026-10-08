import{$t as e,Et as t,Yt as n,ft as r,lt as i,mt as a,st as o,zt as s}from"./framework.8UxoGp64.js";import{Jc as c,Xc as l,_h as u,fh as d,vh as f}from"./theme.89tuodeJ.js";import{t as p}from"./dist.DDZh2RUN.js";var m=[`innerHTML`],h=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,g=a({__name:`03-code-blocks`,setup(a){let g=p(),_=n(g.render(h,{ended:!0}));return(n,a)=>(t(),o(e(l),{blocks:_.value,style:{"inline-size":`100%`}},{default:s(()=>[r(e(c),null,{block:s(({block:n})=>[n.kind===`code`?(t(),o(e(f),{key:0,code:n.source??``,lang:n.lang,complete:n.complete,"line-numbers":``},{default:s(()=>[r(e(u),null,{default:s(()=>[r(e(d))]),_:1})]),_:1},8,[`code`,`lang`,`complete`])):(t(),i(`div`,{key:1,innerHTML:n.html},null,8,m))]),_:1})]),_:1},8,[`blocks`]))}});export{g as default};