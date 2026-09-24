import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{c as t}from"./index.Bj9YYS_y.js";import{X as n,d as o,e as m}from"./code-view.DFy5hQVy.js";import{X as i,a}from"./markdown-stream.BO5G5goq.js";import"./jsx-runtime.BRCQSFi8.js";import"./theme.Dh5psj-1.js";import"./framework.DxrHb2fb.js";import"./config.DFYkkHiw.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.CN2pKJJ-.js";import"./use-machine.BqQ92F7w.js";const s=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,d=t(),p=d.render(s,{ended:!0});function R(){return e.jsx(i,{blocks:p,style:{inlineSize:"100%"},children:e.jsx(a,{children:({block:r})=>r.kind==="code"?e.jsx(n,{code:r.source??"",lang:r.lang,complete:r.complete,lineNumbers:!0,children:e.jsx(o,{children:e.jsx(m,{})})}):e.jsx("div",{dangerouslySetInnerHTML:{__html:r.html}})})})}export{R as default};
