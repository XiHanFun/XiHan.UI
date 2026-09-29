import{bN as l,bO as a,bP as s}from"./theme.UYVbUEgX.js";import{d as p,o as r,c as u,E as n,w as o,k as t,j as f,t as c,p as m}from"./framework.D1FqHTxE.js";const g={style:{display:"grid",gap:"8px","inline-size":"100%"}},h=`export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}`,C=p({__name:"10-block-folding",setup(_){const e=m([11]);return(b,i)=>(r(),u("div",g,[n(t(s),{folded:e.value,"onUpdate:folded":i[0]||(i[0]=d=>e.value=d),code:h,lang:"typescript",complete:"","line-numbers":"","block-folding":""},{default:o(()=>[n(t(l),null,{default:o(()=>[n(t(a))]),_:1})]),_:1},8,["folded"]),f("span",null,"折叠着的块头："+c(e.value.length>0?e.value.join("、"):"无"),1)]))}});export{C as default};
