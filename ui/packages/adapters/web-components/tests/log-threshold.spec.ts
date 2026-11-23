// @vitest-environment jsdom
// 日志的 threshold（距底多少 px 仍算在底部）要交到状态机手里：声明了却没接线时，写多少都按缺省的 64px 判。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type LogElement = HTMLElement & { readonly updateComplete: Promise<boolean> }

const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

/** 挂一份日志，把视口的滚动量换成可控的数：内容 1000 高、视口 200 高。 */
async function mountLog(attrs = ''): Promise<{ root: HTMLElement, scrollTo: (top: number) => Promise<void> }> {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<xh-log ${attrs}>
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content"><div data-xh-part="line">一行日志</div></div>
      </div>
    </div>
  </xh-log>`
  document.body.append(wrapper)
  const host = wrapper.querySelector<LogElement>('xh-log')!
  await host.updateComplete
  await settle()
  const viewport = host.querySelector<HTMLElement>('[data-part="viewport"]')!
  const metrics = { scrollTop: 0, scrollHeight: 1000, clientHeight: 200 }
  for (const key of ['scrollTop', 'scrollHeight', 'clientHeight'] as const) {
    Object.defineProperty(viewport, key, {
      get: () => metrics[key],
      set: (v: number) => {
        metrics[key] = v
      },
      configurable: true,
    })
  }
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    scrollTo: async (top) => {
      metrics.scrollTop = top
      viewport.dispatchEvent(new Event('scroll'))
      await settle()
      await host.updateComplete
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('xh-log 的 threshold', () => {
  it('不写时按缺省 64px：离底 150px 不算在底部', async () => {
    const log = await mountLog()
    await log.scrollTo(800)
    await log.scrollTo(650)
    expect(log.root.hasAttribute('data-at-bottom')).toBe(false)
  })

  it('写 200 时离底 150px 仍算在底部', async () => {
    const log = await mountLog('threshold="200"')
    await log.scrollTo(800)
    await log.scrollTo(650)
    expect(log.root.hasAttribute('data-at-bottom')).toBe(true)
  })
})
