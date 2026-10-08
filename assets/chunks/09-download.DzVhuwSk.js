import{$t as e,Et as t,dt as n,ft as r,mt as i,st as a,zt as o}from"./framework.8UxoGp64.js";import{Jd as s,_h as c,fh as l,hh as u,ph as d,uu as f,vh as p}from"./theme.89tuodeJ.js";import{_ as m}from"./dist.ZGSyedfl.js";var h=`retry.ts`,g=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`,_=i({__name:`09-download`,setup(i){return(i,_)=>(t(),a(e(p),{code:g,lang:`typescript`,filename:h,complete:``,style:{"inline-size":`100%`}},{default:o(()=>[r(e(u),null,{default:o(()=>[r(e(d)),r(e(s),{data:g,"file-name":h,variant:`ghost`,size:`sm`},{default:o(()=>[r(e(f),{icon:e(m)},null,8,[`icon`]),_[0]||=n(` 下载 `,-1)]),_:1})]),_:1}),r(e(c),null,{default:o(()=>[r(e(l))]),_:1})]),_:1}))}});export{_ as default};