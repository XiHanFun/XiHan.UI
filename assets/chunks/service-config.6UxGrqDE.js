function c(r){let e=r;const o=new Set;return{read:()=>(typeof e=="function"?e():e)??{},set:t=>{e=t;for(const n of o)n()},subscribe:t=>(o.add(t),()=>void o.delete(t))}}export{c};
