import{v as e}from"./theme.CZaS8O1o.js";import{t}from"./jsx-runtime.CWLBoBiw.js";import{i as n,n as r,o as i,s as a,t as o}from"./code-view.eciLGIw6.js";import{t as s}from"./download-trigger.Byc8HjwK.js";import{t as c}from"./icon.pCZVaBv5.js";var l=t(),u=`retry.ts`,d=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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