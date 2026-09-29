import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{D as t}from"./index.DfnbpvFp.js";import{X as i,a as s,b as a,d as m,e as n}from"./code-view.CE0-EHZ6.js";import{X as p}from"./download-trigger.DIvZKxL7.js";import{X as l}from"./icon.C7Lc8vP7.js";import"./jsx-runtime.BcTJLmfc.js";import"./theme.BUzG0yHg.js";import"./framework.D1FqHTxE.js";import"./config.D1IAGChV.js";import"./index.CVfUds7h.js";import"./slot-content.DPoKlr88.js";import"./react-id.G53GIPms.js";import"./use-machine.DwQJK_3b.js";import"./index.C5aDBAG5.js";const e="retry.ts",o=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
}`;function T(){return r.jsxs(i,{code:o,lang:"typescript",filename:e,complete:!0,style:{inlineSize:"100%"},children:[r.jsxs(s,{children:[r.jsx(a,{}),r.jsxs(p,{data:o,fileName:e,variant:"ghost",size:"sm",children:[r.jsx(l,{icon:t})," ","下载"]})]}),r.jsx(m,{children:r.jsx(n,{})})]})}export{T as default};
