import{v as e}from"./theme.CLRs_MM8.js";import{t}from"./jsx-runtime.CWLBoBiw.js";import{i as n,n as r,o as i,s as a,t as o}from"./code-view.BCFl7UJ3.js";import{t as s}from"./download-trigger.D8ef-zer.js";import{t as c}from"./icon.ClhCCHb3.js";var l=t(),u=`retry.ts`,d=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`;function f(){return(0,l.jsxs)(a,{code:d,lang:`typescript`,filename:u,complete:!0,style:{inlineSize:`100%`},children:[(0,l.jsxs)(n,{children:[(0,l.jsx)(r,{}),(0,l.jsxs)(s,{data:d,fileName:u,variant:`ghost`,size:`sm`,children:[(0,l.jsx)(c,{icon:e}),` `,`下载`]})]}),(0,l.jsx)(i,{children:(0,l.jsx)(o,{})})]})}export{f as default};