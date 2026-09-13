import{createHighlighter as n}from"./index.Dl0MBU8T.js";import{dg as r,dl as s,dh as c,di as d,dj as l,dk as p}from"./theme.C7zwwLoT.js";import{d as m,o as f,b as u,w as o,E as t,k as e,j as h,h as w}from"./framework.DkvuVDKz.js";const _=`const endpoint = "https://api.example.com/v1/workspaces/{id}/documents?include=revisions&limit=50"
const timeout = 3000
export const client = createClient({ endpoint, timeout })`,g=`const endpoint = "https://api.example.com/v2/workspaces/{id}/documents?include=revisions,authors&limit=100"
const timeout = 8000
export const client = createClient({ endpoint, timeout })`,X=m({__name:"03-wrap-words",setup(x){const a=w(()=>p(_,g,{lang:"typescript",highlighter:n()}));return(V,i)=>(f(),u(e(l),{model:a.value,wrap:""},{default:o(()=>[t(e(r),null,{default:o(()=>[i[0]||(i[0]=h("span",null,"src/client.ts",-1)),t(e(s),{change:"added"}),t(e(s),{change:"removed"})]),_:1}),t(e(c),null,{default:o(()=>[t(e(d))]),_:1})]),_:1},8,["model"]))}});export{X as default};
