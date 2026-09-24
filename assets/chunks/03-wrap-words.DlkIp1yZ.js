import{createHighlighter as n}from"./index.Dl0MBU8T.js";import{jB as r,jC as s,bt as c,bs as p,bu as l,br as d}from"./theme.DlyTCmrO.js";import{d as m,o as u,b as f,w as o,E as t,k as e,j as h,h as w}from"./framework.DxrHb2fb.js";const _=`const endpoint = "https://api.example.com/v1/workspaces/{id}/documents?include=revisions&limit=50"
const timeout = 3000
export const client = createClient({ endpoint, timeout })`,x=`const endpoint = "https://api.example.com/v2/workspaces/{id}/documents?include=revisions,authors&limit=100"
const timeout = 8000
export const client = createClient({ endpoint, timeout })`,k=m({__name:"03-wrap-words",setup(V){const a=w(()=>d(_,x,{lang:"typescript",highlighter:n()}));return(g,i)=>(u(),f(e(l),{model:a.value,wrap:""},{default:o(()=>[t(e(r),null,{default:o(()=>[i[0]||(i[0]=h("span",null,"src/client.ts",-1)),t(e(s),{change:"added"}),t(e(s),{change:"removed"})]),_:1}),t(e(c),null,{default:o(()=>[t(e(p))]),_:1})]),_:1},8,["model"]))}});export{k as default};
