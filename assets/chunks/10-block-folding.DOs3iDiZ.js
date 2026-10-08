async function e(){let e=document.getElementById(`code-view-block-folding`),t=document.getElementById(`code-view-block-folding-state`);e.code=`export function createQueue<T>(limit: number) {
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
}`,e.addEventListener(`folded-change`,e=>{let{folded:n}=e.detail;t.textContent=`折叠着的块头：${n.length>0?n.join(`、`):`无`}`})}export{e as default};