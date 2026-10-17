// xh-log 的回到底部按钮：离底时弹出；回底时先播完退场才收起，退场途中节点仍在、不接指针。
// 动画是否在播、何时收起只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => a.animationName)
}

async function until(check: () => boolean): Promise<void> {
  await expect.poll(check, { timeout: 2000 }).toBe(true)
}

describe('xh-log 回到底部按钮', () => {
  it('回底时先播完退场才收起：退场途中按钮仍显示、不接指针，播完才 display: none', async () => {
    const lines = Array.from({ length: 40 }, (_, i) => `<div data-xh-part="line">第 ${i} 行</div>`).join('')
    document.body.innerHTML = `
      <xh-log rows="6" style="inline-size: 320px">
        <div data-xh-part="root">
          <div data-xh-part="viewport"><div data-xh-part="content">${lines}</div></div>
          <button data-xh-part="scroll-to-end-trigger"></button>
        </div>
      </xh-log>`
    const viewport = document.querySelector<HTMLElement>('xh-log [data-xh-part="viewport"]')!
    const trigger = document.querySelector<HTMLElement>('xh-log [data-xh-part="scroll-to-end-trigger"]')!
    await until(() => getComputedStyle(trigger).display === 'none')

    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))
    viewport.scrollTop = 0
    await until(() => trigger.dataset.state === 'visible' && getComputedStyle(trigger).display !== 'none')

    viewport.scrollTop = viewport.scrollHeight
    await until(() => trigger.dataset.state === 'hidden')
    expect(getComputedStyle(trigger).display).not.toBe('none')
    expect(running(trigger)).toEqual(['xh-pop-out'])
    expect(getComputedStyle(trigger).pointerEvents).toBe('none')
    await until(() => getComputedStyle(trigger).display === 'none')
  })
})
