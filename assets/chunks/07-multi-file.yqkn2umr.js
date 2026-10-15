import{$ as e,Et as t,Lt as n,Zt as r,at as i,ft as a,it as o,st as s,tn as c,ut as l,wt as u}from"./framework.eUj94whv.js";import{cy as d,dy as f,fD as p,fp as m,lp as h,ly as g,oy as _,pD as v,sp as y,sy as b,uy as x}from"./theme.x3bdcchs.js";var S={style:{display:`grid`,gap:`8px`,"inline-size":`100%`}},C={style:{display:`flex`,"align-items":`center`,gap:`8px`}},w=`diff --git a/src/client.ts b/src/client.ts
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
`,T=a({__name:`07-multi-file`,setup(a){let T=v(w).map(e=>{let t=(e.newPath??e.oldPath??``).replace(/^[ab]\//,``);return{path:t,model:{...e,oldPath:t,newPath:t},stats:p(e)}}),E=T.reduce((e,t)=>e+t.stats.added,0),D=T.reduce((e,t)=>e+t.stats.removed,0);return(a,p)=>(u(),s(`div`,S,[o(`span`,null,c(r(T).length)+` 个文件，+`+c(r(E))+` −`+c(r(D)),1),l(r(x),{multiple:``,"default-value":r(T).map(e=>e.path)},{default:n(()=>[(u(!0),s(e,null,t(r(T),e=>(u(),i(r(g),{key:e.path,value:e.path},{default:n(()=>[l(r(b),null,{default:n(()=>[l(r(f),null,{default:n(()=>[o(`span`,null,c(e.path),1),o(`span`,C,[o(`span`,null,`+`+c(e.stats.added)+` −`+c(e.stats.removed),1),l(r(d))])]),_:2},1024)]),_:2},1024),l(r(_),null,{default:n(()=>[l(r(h),{model:e.model},{default:n(()=>[l(r(m),null,{default:n(()=>[l(r(y))]),_:1})]),_:1},8,[`model`])]),_:2},1024)]),_:2},1032,[`value`]))),128))]),_:1},8,[`default-value`])]))}});export{T as default};