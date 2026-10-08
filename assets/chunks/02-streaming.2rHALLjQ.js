import{t as e}from"./react.CbNV8_UV.js";import{t}from"./jsx-runtime.CWLBoBiw.js";import{n,r,t as i}from"./markdown-stream.BE28lxp4.js";import{t as a}from"./dist.DDZh2RUN.js";var o=e(),s=t(),c=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;function l(){let[e,t]=(0,o.useState)([]),[l,u]=(0,o.useState)(!0);return(0,o.useEffect)(()=>{let e=a(),n=0,r=0;function i(){n=Math.min(n+3,c.length);let a=n>=c.length;t(e.render(c.slice(0,n),{ended:a})),u(!a),a||(r=window.setTimeout(i,70))}return i(),()=>{window.clearTimeout(r),e.dispose()}},[]),(0,s.jsxs)(r,{blocks:e,streaming:l,announce:`polite`,style:{inlineSize:`100%`},children:[(0,s.jsx)(i,{}),(0,s.jsx)(n,{})]})}export{l as default};