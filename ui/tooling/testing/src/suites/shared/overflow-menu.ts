// 「更多」菜单的用例共用件：Toolbar 的收纳与 Tabs 的溢出下拉弹的是同一张 Menu。
// 菜单浮层在 Vue / React 里被搬到 body 下、在 Web Components 里由元素自建，都归 menu 的 scope，
// 组件自己的快照里看不到，从整个文档查。

/** 「更多」菜单里身份值为 value 的那一项。 */
export function overflowMenuItem(doc: Document, value: string): HTMLElement | null {
  return doc.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)
}

/** 逐帧等一个条件成立；等满帧数还不成立返回 false。 */
export async function settled(doc: Document, flush: () => Promise<void>, done: () => boolean, frames = 10): Promise<boolean> {
  const win = doc.defaultView!
  for (let round = 0; round < frames; round++) {
    if (done())
      return true
    await flush()
    await new Promise<void>(resolve => win.requestAnimationFrame(() => resolve()))
  }
  return done()
}

/**
 * 等焦点落到 target 上：菜单展开后由焦点域在动画帧上落焦，真实浏览器里这一步晚于适配器的提交。
 * 逐帧等，落到了就返回；等满几帧还没落到，交给调用处按原样判红。
 */
export async function focusSettled(doc: Document, flush: () => Promise<void>, target: () => Element | null): Promise<boolean> {
  return settled(doc, flush, () => doc.activeElement != null && doc.activeElement === target())
}

/**
 * 等「更多」菜单的退场播完：content 收成 display none。真实浏览器里退场要播一段动画，
 * 用例测的是从收起状态重新展开，不测退场途中的打断。
 */
export async function menuExited(doc: Document, flush: () => Promise<void>): Promise<void> {
  const content = (): HTMLElement | null => doc.querySelector<HTMLElement>('[data-scope="menu"][data-part="content"]')
  const hidden = (): boolean => {
    const el = content()
    return el == null || doc.defaultView!.getComputedStyle(el).display === 'none'
  }
  if (!await settled(doc, flush, hidden, 60))
    throw new Error('「更多」菜单收起后退场没有播完')
}
