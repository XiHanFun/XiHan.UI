import{j as s}from"./jsx-runtime.BjG_zV1W.js";import{eK as a,eL as o}from"./theme.UYVbUEgX.js";import{X as i,a as n,b as c,c as d,d as p,e as h}from"./accordion.D2MMzYj0.js";import{X as l,b as m,c as x}from"./diff-view.CWLMI_iQ.js";import"./framework.D1FqHTxE.js";import"./jsx-runtime.DMocbste.js";import"./use-overlay-exit.BiQ_H-iG.js";import"./index.CVfUds7h.js";import"./react-id.NJJT-7js.js";import"./use-machine.EWI1_r3l.js";import"./config.DSMADqfW.js";import"./index.C5aDBAG5.js";import"./slot-content.DPoKlr88.js";const u=`diff --git a/src/client.ts b/src/client.ts
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
`,r=a(u).map(t=>{const e=(t.newPath??t.oldPath??"").replace(/^[ab]\//,"");return{path:e,model:{...t,oldPath:e,newPath:e},stats:o(t)}}),f=r.reduce((t,e)=>t+e.stats.added,0),j=r.reduce((t,e)=>t+e.stats.removed,0);function D(){return s.jsxs("div",{style:{display:"grid",gap:"8px",inlineSize:"100%"},children:[s.jsx("span",{children:`${r.length} 个文件，+${f} −${j}`}),s.jsx(i,{multiple:!0,defaultValue:r.map(t=>t.path),children:r.map(t=>s.jsxs(n,{value:t.path,children:[s.jsx(c,{children:s.jsxs(d,{children:[s.jsx("span",{children:t.path}),s.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[s.jsx("span",{children:`+${t.stats.added} −${t.stats.removed}`}),s.jsx(p,{})]})]})}),s.jsx(h,{children:s.jsx(l,{model:t.model,children:s.jsx(m,{children:s.jsx(x,{})})})})]},t.path))})]})}export{D as default};
