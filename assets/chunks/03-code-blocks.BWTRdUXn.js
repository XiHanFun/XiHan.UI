import{j as e}from"./jsx-runtime.BjG_zV1W.js";import{c as t}from"./index.HwSYhWVk.js";import{X as o,d as n,e as m}from"./code-view.CxbtpwSl.js";import{X as i,a}from"./markdown-stream.qRXoOK2Z.js";import"./normalize-props.B-E-WYUx.js";import"./theme.CAi6RKG1.js";import"./framework.D1FqHTxE.js";import"./config.DSBJRdUs.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./react-id.BHoeg7V-.js";import"./use-machine.46OxBTV-.js";import"./index.DEmbwZee.js";import"./layout-effect.CkQ51VE0.js";const s=`先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`,d=t(),p=d.render(s,{ended:!0});function y(){return e.jsx(i,{blocks:p,style:{inlineSize:"100%"},children:e.jsx(a,{children:({block:r})=>r.kind==="code"?e.jsx(o,{code:r.source??"",lang:r.lang,complete:r.complete,lineNumbers:!0,children:e.jsx(n,{children:e.jsx(m,{})})}):e.jsx("div",{dangerouslySetInnerHTML:{__html:r.html}})})})}export{y as default};
