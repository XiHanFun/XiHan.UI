import{c as d}from"./index.Bj9YYS_y.js";import{db as u,kC as f,dc as k}from"./theme.CgoFSkOP.js";import{d as p,v as w,$ as h,o as _,b as g,w as v,E as l,k as n,G as m}from"./framework.DxrHb2fb.js";const o=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`,x=p({__name:"02-streaming",setup(b){const a=d(),r=m([]),s=m(!0);let e=0,i=0;function c(){e=Math.min(e+3,o.length);const t=e>=o.length;r.value=a.render(o.slice(0,e),{ended:t}),s.value=!t,t||(i=window.setTimeout(c,70))}return w(c),h(()=>{window.clearTimeout(i),a.dispose()}),(t,M)=>(_(),g(n(k),{blocks:r.value,streaming:s.value,announce:"polite",style:{"inline-size":"100%"}},{default:v(()=>[l(n(u)),l(n(f))]),_:1},8,["blocks","streaming"]))}});export{x as default};
