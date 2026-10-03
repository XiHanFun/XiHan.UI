import{j as r}from"./jsx-runtime.BjG_zV1W.js";import{D as t}from"./index.DfnbpvFp.js";import{X as i,a as s,b as a,d as m,e as n}from"./code-view.D1MeBPxF.js";import{X as p}from"./download-trigger.CkAQ4hz9.js";import{X as l}from"./icon.V4l0ToXV.js";import"./normalize-props.Xhi2Ok_z.js";import"./theme.Ddq9Fhix.js";import"./framework.D1FqHTxE.js";import"./config._yqfA1yn.js";import"./index.Cgwy3NI6.js";import"./slot-content.BDi8aYdV.js";import"./react-id.R0XbvH8S.js";import"./use-machine.BiEqyKiZ.js";import"./index.DEmbwZee.js";const e="retry.ts",o=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
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
