import{t as e}from"./jsx-runtime.CWLBoBiw.js";import{o as t,s as n,t as r}from"./code-view.Dpm1ARMa.js";import{r as i,t as a}from"./markdown-stream.BE28lxp4.js";import{t as o}from"./dist.DDZh2RUN.js";var s=e(),c=o().render(`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,{ended:!0});function l(){return(0,s.jsx)(i,{blocks:c,style:{inlineSize:`100%`},children:(0,s.jsx)(a,{children:({block:e})=>e.kind===`code`?(0,s.jsx)(n,{code:e.source??``,lang:e.lang,complete:e.complete,lineNumbers:!0,children:(0,s.jsx)(t,{children:(0,s.jsx)(r,{})})}):(0,s.jsx)(`div`,{dangerouslySetInnerHTML:{__html:e.html}})})})}export{l as default};