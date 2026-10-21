import{Lt as e,Zt as t,at as n,ft as r,lt as i,ut as a,wt as o}from"./framework.eUj94whv.js";import{$g as s,Rh as c,a_ as l,e_ as u,i_ as d,jp as f,n_ as p,v as m}from"./theme.DtyqiN1q.js";var h=`retry.ts`,g=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`,_=r({__name:`09-download`,setup(r){return(r,_)=>(o(),n(t(l),{code:g,lang:`typescript`,filename:h,complete:``,style:{"inline-size":`100%`}},{default:e(()=>[a(t(p),null,{default:e(()=>[a(t(u)),a(t(f),{data:g,"file-name":h,variant:`ghost`,size:`sm`},{default:e(()=>[a(t(c),{icon:t(m)},null,8,[`icon`]),_[0]||=i(` 下载 `,-1)]),_:1})]),_:1}),a(t(d),null,{default:e(()=>[a(t(s))]),_:1})]),_:1}))}});export{_ as default};