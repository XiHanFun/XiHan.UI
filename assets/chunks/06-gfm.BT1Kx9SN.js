import{Lt as e,Zt as t,at as n,ft as r,qt as i,ut as a,wt as o}from"./framework.eUj94whv.js";import{cu as s,ou as c}from"./theme.x3bdcchs.js";import{t as l}from"./dist.DDZh2RUN.js";var u=`发布前的检查[^1]：

- [x] 构建通过
- [x] 门禁通过
- [ ] 更新日志

详见 https://ui.docs.xihanfun.com 的发版说明。

[^1]: 按仓库的发版流程逐项确认。
`,d=r({__name:`06-gfm`,setup(r){let d=l({idPrefix:`release-`}),f=i(d.render(u,{ended:!0}));return(r,i)=>(o(),n(t(s),{blocks:f.value,style:{"inline-size":`100%`}},{default:e(()=>[a(t(c))]),_:1},8,[`blocks`]))}});export{d as default};