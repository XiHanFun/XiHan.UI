import{eO as f,eP as h,a as m,b as _,d as g,e as y,f as X,eK as b,eI as x,eJ as v,X as w}from"./theme.CivESN_z.js";import{d as A,o as l,c as i,j as d,t as o,k as t,E as r,w as n,F as R,B,b as E}from"./framework.D1FqHTxE.js";const P={style:{display:"grid",gap:"8px","inline-size":"100%"}},V={style:{display:"flex","align-items":"center",gap:"8px"}},k=`diff --git a/src/client.ts b/src/client.ts
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
`,S=A({__name:"07-multi-file",setup(I){const c=f(k).map(e=>{const a=(e.newPath??e.oldPath??"").replace(/^[ab]\//,"");return{path:a,model:{...e,oldPath:a,newPath:a},stats:h(e)}}),u=c.reduce((e,a)=>e+a.stats.added,0),p=c.reduce((e,a)=>e+a.stats.removed,0);return(e,a)=>(l(),i("div",P,[d("span",null,o(t(c).length)+" 个文件，+"+o(t(u))+" −"+o(t(p)),1),r(t(w),{multiple:"","default-value":t(c).map(s=>s.path)},{default:n(()=>[(l(!0),i(R,null,B(t(c),s=>(l(),E(t(m),{key:s.path,value:s.path},{default:n(()=>[r(t(_),null,{default:n(()=>[r(t(g),null,{default:n(()=>[d("span",null,o(s.path),1),d("span",V,[d("span",null,"+"+o(s.stats.added)+" −"+o(s.stats.removed),1),r(t(y))])]),_:2},1024)]),_:2},1024),r(t(X),null,{default:n(()=>[r(t(b),{model:s.model},{default:n(()=>[r(t(x),null,{default:n(()=>[r(t(v))]),_:1})]),_:1},8,["model"])]),_:2},1024)]),_:2},1032,["value"]))),128))]),_:1},8,["default-value"])]))}});export{S as default};
