import{$T as e,QT as t}from"./theme.89tuodeJ.js";import{a as n,i as r,n as i,o as a,r as o,t as s}from"./accordion.Dlm4YP9X.js";import{t as c}from"./jsx-runtime.CWLBoBiw.js";import{o as l,r as u,t as d}from"./diff-view.bR7Am9V-.js";var f=c(),p=e(`diff --git a/src/client.ts b/src/client.ts
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
`).map(e=>{let n=(e.newPath??e.oldPath??``).replace(/^[ab]\//,``);return{path:n,model:{...e,oldPath:n,newPath:n},stats:t(e)}}),m=p.reduce((e,t)=>e+t.stats.added,0),h=p.reduce((e,t)=>e+t.stats.removed,0);function g(){return(0,f.jsxs)(`div`,{style:{display:`grid`,gap:`8px`,inlineSize:`100%`},children:[(0,f.jsx)(`span`,{children:`${p.length} 个文件，+${m} −${h}`}),(0,f.jsx)(n,{multiple:!0,defaultValue:p.map(e=>e.path),children:p.map(e=>(0,f.jsxs)(r,{value:e.path,children:[(0,f.jsx)(i,{children:(0,f.jsxs)(a,{children:[(0,f.jsx)(`span`,{children:e.path}),(0,f.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{children:`+${e.stats.added} −${e.stats.removed}`}),(0,f.jsx)(o,{})]})]})}),(0,f.jsx)(s,{children:(0,f.jsx)(u,{model:e.model,children:(0,f.jsx)(l,{children:(0,f.jsx)(d,{})})})})]},e.path))})]})}export{g as default};