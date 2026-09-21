import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{c as d}from"./index.Bj9YYS_y.js";import{X as u,a as f,b as S}from"./markdown-stream.Dq8274Eo.js";import{r as o}from"./index.Cgwy3NI6.js";import"./jsx-runtime.CkCqEvy3.js";import"./theme.VZGDCnnk.js";import"./framework.DxrHb2fb.js";import"./config.BEdeCISN.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";const n=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;function b(){const[m,c]=o.useState([]),[p,l]=o.useState(!0);return o.useEffect(()=>{const i=d();let t=0,s=0;function a(){t=Math.min(t+3,n.length);const e=t>=n.length;c(i.render(n.slice(0,t),{ended:e})),l(!e),e||(s=window.setTimeout(a,70))}return a(),()=>{window.clearTimeout(s),i.dispose()}},[]),r.jsxs(u,{blocks:m,streaming:p,announce:"polite",style:{inlineSize:"100%"},children:[r.jsx(f,{}),r.jsx(S,{})]})}export{b as default};
