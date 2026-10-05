import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{D as t}from"./index.DfnbpvFp.js";import{X as i,a as s,b as a,d as m,e as n}from"./code-view.ByFc3fpA.js";import{X as p}from"./download-trigger.tG8-RUWP.js";import{X as l}from"./icon.DkjYBovu.js";import"./normalize-props.BHQTd-S8.js";import"./theme.CivESN_z.js";import"./framework.D1FqHTxE.js";import"./config.m0IiGLfc.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./react-id.DPv7M-sg.js";import"./use-machine.BKyDWuxn.js";import"./index.DEmbwZee.js";const e="retry.ts",o=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
