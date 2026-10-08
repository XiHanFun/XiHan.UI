import{$t as e,Ct as t,Et as n,St as r,Yt as i,ft as a,mt as o,st as s,zt as c}from"./framework.8UxoGp64.js";import{Jc as l,Xc as u,Yc as d}from"./theme.89tuodeJ.js";import{t as f}from"./dist.DDZh2RUN.js";var p=`## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`,m=o({__name:`02-streaming`,setup(o){let m=f(),h=i([]),g=i(!0),_=0,v=0;function y(){_=Math.min(_+3,p.length);let e=_>=p.length;h.value=m.render(p.slice(0,_),{ended:e}),g.value=!e,e||(v=window.setTimeout(y,70))}return t(y),r(()=>{window.clearTimeout(v),m.dispose()}),(t,r)=>(n(),s(e(u),{blocks:h.value,streaming:g.value,announce:`polite`,style:{"inline-size":`100%`}},{default:c(()=>[a(e(l)),a(e(d))]),_:1},8,[`blocks`,`streaming`]))}});export{m as default};