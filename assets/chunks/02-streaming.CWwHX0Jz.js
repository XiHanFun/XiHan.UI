import{Lt as e,Zt as t,at as n,bt as r,ft as i,qt as a,ut as o,wt as s,xt as c}from"./framework.eUj94whv.js";import{dl as l,fl as u,pl as d}from"./theme.DtyqiN1q.js";import{t as f}from"./dist.DDZh2RUN.js";var p=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`,m=i({__name:`02-streaming`,setup(i){let m=f(),h=a([]),g=a(!0),_=0,v=0;function y(){_=Math.min(_+3,p.length);let e=_>=p.length;h.value=m.render(p.slice(0,_),{ended:e}),g.value=!e,e||(v=window.setTimeout(y,70))}return c(y),r(()=>{window.clearTimeout(v),m.dispose()}),(r,i)=>(s(),n(t(d),{blocks:h.value,streaming:g.value,announce:`polite`,style:{"inline-size":`100%`}},{default:e(()=>[o(t(l)),o(t(u))]),_:1},8,[`blocks`,`streaming`]))}});export{m as default};