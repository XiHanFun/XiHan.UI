import{c as d}from"./index.Bj9YYS_y.js";import{fd as u,hj as f,fc as k}from"./theme.DCKLS07e.js";import{d as p,v as h,$ as w,o as _,b as g,w as v,E as l,k as n,G as m}from"./framework.BpF7DVZ1.js";const o=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`,B=p({__name:"02-streaming",setup(M){const a=d(),r=m([]),s=m(!0);let e=0,i=0;function c(){e=Math.min(e+3,o.length);const t=e>=o.length;r.value=a.render(o.slice(0,e),{ended:t}),s.value=!t,t||(i=window.setTimeout(c,70))}return h(c),w(()=>{window.clearTimeout(i),a.dispose()}),(t,b)=>(_(),g(n(k),{blocks:r.value,streaming:s.value,announce:"polite",style:{"inline-size":"100%"}},{default:v(()=>[l(n(u)),l(n(f))]),_:1},8,["blocks","streaming"]))}});export{B as default};
