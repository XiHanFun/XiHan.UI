import { afterEach, describe, expect, it } from 'vitest'
import { announce, resetAnnouncer } from '../../src/kernel/capability/a11y/announcer'

afterEach(() => {
  resetAnnouncer(document)
  document.body.replaceChildren()
  document.body.removeAttribute('style')
})

function region(): HTMLElement {
  const el = document.querySelector<HTMLElement>('[data-xh-announcer]')
  expect(el).not.toBeNull()
  return el!
}

async function written(text: string): Promise<void> {
  await expect.poll(() => region().textContent).toBe(text)
}

describe('页面级礼貌播报器（Chromium）', () => {
  it('播报区是 1px 的裁切盒，长句不换行、不撑出页面的滚动范围', async () => {
    document.body.style.margin = '0'
    const filler = document.createElement('div')
    filler.style.blockSize = '200px'
    document.body.append(filler)
    const before = [document.documentElement.scrollWidth, document.documentElement.scrollHeight]
    announce('已把「订单明细」移到「页脚」下面，第 3 项，共 3 项。'.repeat(8))
    await written('已把「订单明细」移到「页脚」下面，第 3 项，共 3 项。'.repeat(8))
    const box = region().getBoundingClientRect()
    const style = getComputedStyle(region())
    expect([box.width, box.height]).toEqual([1, 1])
    expect([style.position, style.overflow, style.whiteSpace, style.clipPath]).toEqual(['absolute', 'hidden', 'nowrap', 'inset(50%)'])
    expect([document.documentElement.scrollWidth, document.documentElement.scrollHeight]).toEqual(before)
  })

  it('播报区直接挂在 body 下，是礼貌级状态区，里面只有这句话的文本', async () => {
    announce('已撤销')
    await written('已撤销')
    const el = region()
    expect(el.parentElement).toBe(document.body)
    expect([el.getAttribute('role'), el.getAttribute('aria-live'), el.getAttribute('aria-atomic')]).toEqual(['status', 'polite', 'true'])
    expect(el.children).toHaveLength(0)
  })
})
