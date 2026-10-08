import{t as e}from"./jsx-runtime.CWLBoBiw.js";import{i as t,n,o as r,s as i,t as a}from"./code-view.Dpm1ARMa.js";import{t as o}from"./download-trigger.GUrU3Ysi.js";import{t as s}from"./icon.C4AxK619.js";import{_ as c}from"./dist.ZGSyedfl.js";var l=e(),u=`retry.ts`,d=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`;function f(){return(0,l.jsxs)(i,{code:d,lang:`typescript`,filename:u,complete:!0,style:{inlineSize:`100%`},children:[(0,l.jsxs)(t,{children:[(0,l.jsx)(n,{}),(0,l.jsxs)(o,{data:d,fileName:u,variant:`ghost`,size:`sm`,children:[(0,l.jsx)(s,{icon:c}),` `,`下载`]})]}),(0,l.jsx)(r,{children:(0,l.jsx)(a,{})})]})}export{f as default};