// 面级披露中途反向：展开到一半点收起，内容区从此刻的高度接着收，不先跳到全开；
// 收起到一半再展开，同样从此刻接着展，不先塌成 0。关键帧的中途状态只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhAccordionContent, XhAccordionItem, XhAccordionRoot, XhAccordionTrigger, XhCollapsibleContent, XhCollapsibleRoot, XhCollapsibleTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const BODY = Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 行说明文字`).join('。')

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.style.removeProperty('--xh-motion-duration-expand')
  document.documentElement.style.removeProperty('--xh-motion-duration-collapse')
  document.documentElement.style.removeProperty('--xh-motion-ease-enter-strong')
  document.documentElement.style.removeProperty('--xh-motion-ease-exit')
})

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function height(el: HTMLElement): number {
  return el.getBoundingClientRect().height
}

async function reverseMidway(content: () => HTMLElement, toggle: (open: boolean) => Promise<void>): Promise<void> {
  // 放慢到看得清中途：展开与收起各走 600ms、匀速，中途开到几成与时间成正比
  document.documentElement.style.setProperty('--xh-motion-duration-expand', '600ms')
  document.documentElement.style.setProperty('--xh-motion-duration-collapse', '600ms')
  document.documentElement.style.setProperty('--xh-motion-ease-enter-strong', 'linear')
  document.documentElement.style.setProperty('--xh-motion-ease-exit', 'linear')

  // 先完整开合一轮，量出全开的高度
  await toggle(true)
  await wait(700)
  await frame()
  const full = height(content())
  await toggle(false)
  await wait(700)
  await frame()

  await toggle(true)
  await wait(200)
  await frame()
  const midway = height(content())
  await toggle(false)
  await frame()
  const afterReverse = height(content())
  // 中途确实在半路上
  expect(midway).toBeGreaterThan(0)
  expect(midway).toBeLessThan(full)
  // 反向之后从此刻接着收：不先跳到全开
  expect(afterReverse).toBeLessThanOrEqual(midway + 2)
  expect(afterReverse).toBeGreaterThan(0)

  await wait(200)
  await frame()
  const collapsing = height(content())
  await toggle(true)
  await frame()
  // 收到一半再展开：从此刻接着展，不先塌成 0
  expect(height(content())).toBeGreaterThanOrEqual(collapsing - 2)
}

describe('面级披露中途反向接着走', () => {
  it('collapsible', async () => {
    const open = ref(false)
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhCollapsibleRoot, { 'open': open.value, 'onUpdate:open': (v: boolean) => { open.value = v } }, () => [
        h(XhCollapsibleTrigger, null, () => '详情'),
        h(XhCollapsibleContent, null, () => BODY),
      ]),
    })
    app.mount(host)
    await nextTick()
    await reverseMidway(
      () => host!.querySelector<HTMLElement>('[data-scope="collapsible"][data-part="content"]')!,
      async (next) => {
        open.value = next
        await nextTick()
      },
    )
  })

  it('accordion', async () => {
    const value = ref<string[]>([])
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhAccordionRoot, { 'value': value.value, 'onUpdate:value': (v: string[]) => { value.value = v } }, () => [
        h(XhAccordionItem, { value: 'a' }, () => [
          h(XhAccordionTrigger, null, () => '第一项'),
          h(XhAccordionContent, null, () => BODY),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()
    await reverseMidway(
      () => host!.querySelector<HTMLElement>('[data-scope="accordion"][data-part="content"]')!,
      async (next) => {
        value.value = next ? ['a'] : []
        await nextTick()
      },
    )
  })
})
