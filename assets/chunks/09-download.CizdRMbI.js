import{v as e}from"./theme.VO-fEBmc.js";import{n as t}from"./normalize-props.O31TtG2D.js";import{i as n,n as r,o as i,s as a,t as o}from"./code-view.BA_6hN3H.js";import{t as s}from"./icon.CwU1509d.js";import{t as c}from"./download-trigger.C_lJCxEb.js";var l=t(),u=`retry.ts`,d=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`;function f(){return(0,l.jsxs)(a,{code:d,lang:`typescript`,filename:u,complete:!0,style:{inlineSize:`100%`},children:[(0,l.jsxs)(n,{children:[(0,l.jsx)(r,{}),(0,l.jsxs)(c,{data:d,fileName:u,variant:`ghost`,size:`sm`,children:[(0,l.jsx)(s,{icon:e}),` `,`下载`]})]}),(0,l.jsx)(i,{children:(0,l.jsx)(o,{})})]})}export{f as default};