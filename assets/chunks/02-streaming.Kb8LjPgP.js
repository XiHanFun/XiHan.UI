import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{c as d}from"./index.HwSYhWVk.js";import{X as u,a as f,b as S}from"./markdown-stream.DjasZZJP.js";import{r as o}from"./index.Cgwy3NI6.js";import"./normalize-props.BBtJgH4c.js";import"./theme.3wlaQcnM.js";import"./framework.D1FqHTxE.js";import"./config.DmmQdLgd.js";import"./slot-content.BDi8aYdV.js";import"./layout-effect.CkQ51VE0.js";import"./index.DEmbwZee.js";const n=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;function y(){const[m,c]=o.useState([]),[p,l]=o.useState(!0);return o.useEffect(()=>{const i=d();let t=0,s=0;function a(){t=Math.min(t+3,n.length);const e=t>=n.length;c(i.render(n.slice(0,t),{ended:e})),l(!e),e||(s=window.setTimeout(a,70))}return a(),()=>{window.clearTimeout(s),i.dispose()}},[]),r.jsxs(u,{blocks:m,streaming:p,announce:"polite",style:{inlineSize:"100%"},children:[r.jsx(f,{}),r.jsx(S,{})]})}export{y as default};
