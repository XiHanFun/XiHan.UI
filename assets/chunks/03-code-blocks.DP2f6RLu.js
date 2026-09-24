import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{c as t}from"./index.Bj9YYS_y.js";import{X as n,d as o,e as m}from"./code-view.C_Zj37Cg.js";import{X as i,a}from"./markdown-stream.MYhK-nCT.js";import"./jsx-runtime.-AXCqYzD.js";import"./theme.Bzz-Xp1E.js";import"./framework.DxrHb2fb.js";import"./config.BH93Nl8i.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.71E7iuho.js";import"./use-machine.CEcSVdwa.js";const s=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,d=t(),p=d.render(s,{ended:!0});function R(){return e.jsx(i,{blocks:p,style:{inlineSize:"100%"},children:e.jsx(a,{children:({block:r})=>r.kind==="code"?e.jsx(n,{code:r.source??"",lang:r.lang,complete:r.complete,lineNumbers:!0,children:e.jsx(o,{children:e.jsx(m,{})})}):e.jsx("div",{dangerouslySetInnerHTML:{__html:r.html}})})})}export{R as default};
