import{j as s}from"./jsx-runtime.BjG_zV1W.js";import{eO as a,eP as o}from"./theme.9ANMazNn.js";import{X as i,a as n,b as c,c as d,d as p,e as h}from"./accordion.DEFimywp.js";import{X as l,b as m,c as x}from"./diff-view.BUPlUIxB.js";import"./framework.D1FqHTxE.js";import"./normalize-props.C1_5D97O.js";import"./use-overlay-exit.C4DwINrn.js";import"./index.Cgwy3NI6.js";import"./react-id.BI0pvbui.js";import"./use-machine.B_S1XR9O.js";import"./config.b7WwVQJj.js";import"./index.DEmbwZee.js";import"./slot-content.BDi8aYdV.js";const u=`diff --git a/src/client.ts b/src/client.ts
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
