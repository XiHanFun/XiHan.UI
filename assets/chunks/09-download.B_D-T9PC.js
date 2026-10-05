import{D as s}from"./index.DfnbpvFp.js";import{bK as i,bL as l,an as d,g as c,bN as m,bO as u,bP as f}from"./theme.B46t0kFy.js";import{d as p,o as w,b as h,w as t,E as o,k as e,a as _}from"./framework.D1FqHTxE.js";const r="retry.ts",n=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`,g=p({__name:"09-download",setup(C){return(V,a)=>(w(),h(e(f),{code:n,lang:"typescript",filename:r,complete:"",style:{"inline-size":"100%"}},{default:t(()=>[o(e(i),null,{default:t(()=>[o(e(l)),o(e(d),{data:n,"file-name":r,variant:"ghost",size:"sm"},{default:t(()=>[o(e(c),{icon:e(s)},null,8,["icon"]),a[0]||(a[0]=_(" 下载 ",-1))]),_:1})]),_:1}),o(e(m),null,{default:t(()=>[o(e(u))]),_:1})]),_:1}))}});export{g as default};
