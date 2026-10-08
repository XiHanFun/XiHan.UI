import{$t as e,Et as t,Ot as n,ft as r,lt as i,mt as a,ot as o,rn as s,st as c,tt as l,zt as u}from"./framework.8UxoGp64.js";import{$v as d,Qv as f,Zv as p,ap as m,ep as h,ey as g,iD as _,np as v,ny as y,rD as b,ty as x}from"./theme.CLRs_MM8.js";var S={style:{display:`grid`,gap:`8px`,"inline-size":`100%`}},C={style:{display:`flex`,"align-items":`center`,gap:`8px`}},w=`diff --git a/src/client.ts b/src/client.ts
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
`,T=a({__name:`07-multi-file`,setup(a){let T=_(w).map(e=>{let t=(e.newPath??e.oldPath??``).replace(/^[ab]\//,``);return{path:t,model:{...e,oldPath:t,newPath:t},stats:b(e)}}),E=T.reduce((e,t)=>e+t.stats.added,0),D=T.reduce((e,t)=>e+t.stats.removed,0);return(a,_)=>(t(),i(`div`,S,[o(`span`,null,s(e(T).length)+` 个文件，+`+s(e(E))+` −`+s(e(D)),1),r(e(x),{multiple:``,"default-value":e(T).map(e=>e.path)},{default:u(()=>[(t(!0),i(l,null,n(e(T),n=>(t(),c(e(g),{key:n.path,value:n.path},{default:u(()=>[r(e(f),null,{default:u(()=>[r(e(y),null,{default:u(()=>[o(`span`,null,s(n.path),1),o(`span`,C,[o(`span`,null,`+`+s(n.stats.added)+` −`+s(n.stats.removed),1),r(e(d))])]),_:2},1024)]),_:2},1024),r(e(p),null,{default:u(()=>[r(e(v),{model:n.model},{default:u(()=>[r(e(m),null,{default:u(()=>[r(e(h))]),_:1})]),_:1},8,[`model`])]),_:2},1024)]),_:2},1032,[`value`]))),128))]),_:1},8,[`default-value`])]))}});export{T as default};