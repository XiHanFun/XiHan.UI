// 滚动区的命令式滚动与两个通知：元素的 scrollTo 滚的是 viewport，参数与原生同形；
// scroll-change 按轴派发，reach-end 只在跨过末端那一下派发。
import type { ScrollAreaScrollDetails } from '@xihan-ui/headless'
import type { XhScrollAreaElement } from '../../src/elements/scroll-area'
import { afterEach, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()
let host: XhScrollAreaElement | undefined

async function frames(): Promise<void> {
  await host?.updateComplete
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await host?.updateComplete
}

afterEach(() => {
  host?.remove()
  host = undefined
})

it('scrollTo 滚 viewport 而不是元素自己；两个通知按轴派发、到头只派发一次', async () => {
  host = document.createElement('xh-scroll-area') as XhScrollAreaElement
  host.innerHTML = `
    <div data-xh-part="root" style="inline-size: 200px; block-size: 120px">
      <div data-xh-part="viewport" style="block-size: 100%">
        <div data-xh-part="content"><div style="inline-size: 600px; block-size: 1000px">长内容</div></div>
      </div>
      <div data-xh-part="scrollbar" orientation="vertical">
        <div data-xh-part="track"><div data-xh-part="thumb"></div></div>
      </div>
    </div>`
  const changes: ScrollAreaScrollDetails[] = []
  const ends: ScrollAreaScrollDetails[] = []
  host.addEventListener('scroll-change', e => changes.push((e as CustomEvent<ScrollAreaScrollDetails>).detail))
  host.addEventListener('reach-end', e => ends.push((e as CustomEvent<ScrollAreaScrollDetails>).detail))
  document.body.append(host)
  await frames()
  const viewport = host.querySelector<HTMLElement>('[data-part="viewport"]')!

  host.scrollTo({ top: 50 })
  await frames()
  expect(viewport.scrollTop).toBe(50)
  expect(host.scrollTop).toBe(0)
  expect(changes.at(-1)).toMatchObject({ orientation: 'vertical', offset: 50 })

  // 数字形式按原生的 (left, top) 解读
  host.scrollTo(0, 100000)
  await frames()
  host.scrollTo({ top: 100000 })
  await frames()
  expect(ends).toHaveLength(1)
  expect(ends[0]).toMatchObject({ orientation: 'vertical', offset: viewport.scrollHeight - viewport.clientHeight })
})
