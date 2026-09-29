import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{c as d}from"./index.HwSYhWVk.js";import{X as u,a as f,b as S}from"./markdown-stream.D3DUDBv0.js";import{r as o}from"./index.Cgwy3NI6.js";import"./jsx-runtime.BcTJLmfc.js";import"./theme.BUzG0yHg.js";import"./framework.D1FqHTxE.js";import"./config.D1IAGChV.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./layout-effect.DMnrudsW.js";import"./index.C5aDBAG5.js";const i=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;function T(){const[a,c]=o.useState([]),[p,l]=o.useState(!0);return o.useEffect(()=>{const n=d();let t=0,s=0;function m(){t=Math.min(t+3,i.length);const e=t>=i.length;c(n.render(i.slice(0,t),{ended:e})),l(!e),e||(s=window.setTimeout(m,70))}return m(),()=>{window.clearTimeout(s),n.dispose()}},[]),r.jsxs(u,{blocks:a,streaming:p,announce:"polite",style:{inlineSize:"100%"},children:[r.jsx(f,{}),r.jsx(S,{})]})}export{T as default};
