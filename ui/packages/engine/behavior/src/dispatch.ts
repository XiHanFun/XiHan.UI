// 派发一个可取消的 CustomEvent；返回 true 表示未被 preventDefault。
export function dispatchCancelable<D>(el: EventTarget, type: string, detail: D): boolean {
  const ev = new CustomEvent(type, { bubbles: false, cancelable: true, detail })
  el.dispatchEvent(ev)
  return !ev.defaultPrevented
}
