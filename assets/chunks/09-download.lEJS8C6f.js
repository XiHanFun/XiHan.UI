import{$t as e,Et as t,dt as n,ft as r,mt as i,st as a,zt as o}from"./framework.8UxoGp64.js";import{$f as s,Cg as c,Sg as l,_g as u,bg as d,hd as f,v as p,vg as m}from"./theme.CZaS8O1o.js";var h=`retry.ts`,g=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}`,_=i({__name:`09-download`,setup(i){return(i,_)=>(t(),a(e(c),{code:g,lang:`typescript`,filename:h,complete:``,style:{"inline-size":`100%`}},{default:o(()=>[r(e(d),null,{default:o(()=>[r(e(m)),r(e(s),{data:g,"file-name":h,variant:`ghost`,size:`sm`},{default:o(()=>[r(e(f),{icon:e(p)},null,8,[`icon`]),_[0]||=n(` 下载 `,-1)]),_:1})]),_:1}),r(e(l),null,{default:o(()=>[r(e(u))]),_:1})]),_:1}))}});export{_ as default};