import{fD as e,pD as t}from"./theme.x3bdcchs.js";import{t as n}from"./jsx-runtime.CoN_kYeJ.js";import{a as r,i,n as a,o,r as s,t as c}from"./accordion.B3SLAu15.js";import{o as l,r as u,t as d}from"./diff-view.Ua2VtXAX.js";var f=n(),p=t(`diff --git a/src/client.ts b/src/client.ts
--- a/src/client.ts
+++ b/src/client.ts
@@ -1,3 +1,4 @@
 export function createClient(base: string) {
-  return fetchJson(base, { timeout: 5000 })
+  const headers = { accept: "application/json" }
+  return fetchJson(base, { timeout: 30000, headers })
 }
diff --git a/src/retry.ts b/src/retry.ts
--- a/src/retry.ts
+++ b/src/retry.ts
@@ -1,4 +1,4 @@
-export const MAX_RETRIES = 3
+export const MAX_RETRIES = 5
 export function shouldRetry(status: number) {
   return status >= 500
 }
`).map(t=>{let n=(t.newPath??t.oldPath??``).replace(/^[ab]\//,``);return{path:n,model:{...t,oldPath:n,newPath:n},stats:e(t)}}),m=p.reduce((e,t)=>e+t.stats.added,0),h=p.reduce((e,t)=>e+t.stats.removed,0);function g(){return(0,f.jsxs)(`div`,{style:{display:`grid`,gap:`8px`,inlineSize:`100%`},children:[(0,f.jsx)(`span`,{children:`${p.length} 个文件，+${m} −${h}`}),(0,f.jsx)(r,{multiple:!0,defaultValue:p.map(e=>e.path),children:p.map(e=>(0,f.jsxs)(i,{value:e.path,children:[(0,f.jsx)(a,{children:(0,f.jsxs)(o,{children:[(0,f.jsx)(`span`,{children:e.path}),(0,f.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{children:`+${e.stats.added} −${e.stats.removed}`}),(0,f.jsx)(s,{})]})]})}),(0,f.jsx)(c,{children:(0,f.jsx)(u,{model:e.model,children:(0,f.jsx)(l,{children:(0,f.jsx)(d,{})})})})]},e.path))})]})}export{g as default};