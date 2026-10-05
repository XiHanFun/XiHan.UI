// @vitest-environment jsdom
// 连接层写的 class 按词增删：解剖带的挂载类加上去、不再给就撤掉，交还时一并撤掉；作者自己写在节点上的类始终不碰。
import { describe, expect, it } from 'vitest'
import { createSpreader } from '../src/dom/spread'

function node(cls = ''): HTMLElement {
  const el = document.createElement('div')
  if (cls)
    el.className = cls
  return el
}

describe('spread 的 class 对账', () => {
  it('挂载类加在作者的类旁边，不整串覆盖', () => {
    const spreader = createSpreader()
    const el = node('mine')
    spreader.spread(el, { 'data-scope': 'dialog', 'class': 'xh-scope-dialog' })
    expect([...el.classList]).toEqual(['mine', 'xh-scope-dialog'])
  })

  it('每帧重铺同一个类不留变更记录', async () => {
    const spreader = createSpreader()
    const el = node()
    spreader.spread(el, { class: 'xh-scope-dialog' })
    const records: MutationRecord[] = []
    const observer = new MutationObserver(list => records.push(...list))
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    spreader.spread(el, { class: 'xh-scope-dialog' })
    await Promise.resolve()
    observer.disconnect()
    expect(records).toHaveLength(0)
  })

  it('上一帧写过、这一帧不再给的词撤掉，作者的类留着', () => {
    const spreader = createSpreader()
    const el = node('mine')
    spreader.spread(el, { class: 'xh-scope-dialog' })
    spreader.spread(el, {})
    expect([...el.classList]).toEqual(['mine'])
  })

  it('交还时撤掉写过的词', () => {
    const spreader = createSpreader()
    const el = node('mine')
    spreader.spread(el, { class: 'xh-scope-drawer' })
    spreader.release(el)
    expect([...el.classList]).toEqual(['mine'])
  })

  it('节点被挪进另一台宿主：接管方撤掉前一台留下、自己不再写的词', () => {
    const first = createSpreader()
    const second = createSpreader()
    const el = node()
    first.spread(el, { class: 'xh-scope-dialog' })
    second.spread(el, { class: 'xh-scope-drawer' })
    expect([...el.classList]).toEqual(['xh-scope-drawer'])
    // 原宿主交还时已不持有归属，接管方写的类不被删
    first.release(el)
    expect([...el.classList]).toEqual(['xh-scope-drawer'])
  })
})
