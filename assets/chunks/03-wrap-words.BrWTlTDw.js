import{createHighlighter as n}from"./index.Dl0MBU8T.js";import{d4 as r,d9 as s,d5 as c,d6 as d,d7 as p,d8 as l}from"./theme.CzGOHWR9.js";import{d as m,o as f,b as u,w as o,E as t,k as e,j as h,h as w}from"./framework.m090XgxO.js";const _=`const endpoint = "https://api.example.com/v1/workspaces/{id}/documents?include=revisions&limit=50"
const timeout = 3000
export const client = createClient({ endpoint, timeout })`,x=`const endpoint = "https://api.example.com/v2/workspaces/{id}/documents?include=revisions,authors&limit=100"
const timeout = 8000
export const client = createClient({ endpoint, timeout })`,X=m({__name:"03-wrap-words",setup(V){const a=w(()=>l(_,x,{lang:"typescript",highlighter:n()}));return(g,i)=>(f(),u(e(p),{model:a.value,wrap:""},{default:o(()=>[t(e(r),null,{default:o(()=>[i[0]||(i[0]=h("span",null,"src/client.ts",-1)),t(e(s),{change:"added"}),t(e(s),{change:"removed"})]),_:1}),t(e(c),null,{default:o(()=>[t(e(d))]),_:1})]),_:1},8,["model"]))}});export{X as default};
