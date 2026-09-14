// @vitest-environment jsdom
// 徽标收窄成「只做角标」：root 是锚点、indicator 是贴在它角上的那枚标记。
//
// 行内的状态药丸不再归它管——那与 tag 逐值重叠，两个组件做同一件事只会让人选错。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBadge } from '../src'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function mount(props: Record<string, unknown>, child = '收件箱'): Promise<void> {
  // 同一条用例里换参数重挂：先拆掉上一份，否则 part() 取到的还是旧那枚
  app?.unmount()
  document.body.innerHTML = ''
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => h(XhBadge, props, () => [h('button', child)]) })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="badge"][data-part="${name}"]`)
}

describe('角标', () => {
  it('两层解剖：锚点裹住被标记的东西，角标是另一层', async () => {
    await mount({ count: 5 })
    const root = part('root')!
    const indicator = part('indicator')!

    expect(root.querySelector('button')?.textContent).toBe('收件箱')
    expect(root.contains(indicator)).toBe(true)
    expect(indicator.textContent).toBe('5')
  })

  it('超过上限写成 max+，不把角标撑变形', async () => {
    await mount({ count: 128, max: 99 })
    expect(part('indicator')!.textContent).toBe('99+')
  })

  it('计数为 0 时角标收起，锚点与宿主还在', async () => {
    await mount({ count: 0 })
    expect(part('indicator')!.hasAttribute('hidden')).toBe(true)
    expect(part('root')!.querySelector('button')).not.toBeNull()
  })

  it('showZero 显式要求时 0 也显示', async () => {
    await mount({ count: 0, showZero: true })
    expect(part('indicator')!.hasAttribute('hidden')).toBe(false)
    expect(part('indicator')!.textContent).toBe('0')
  })

  it('圆点只表示「有」，不出数字', async () => {
    await mount({ count: 9, dot: true })
    const indicator = part('indicator')!
    expect(indicator.getAttribute('data-dot')).toBe('')
    expect(indicator.textContent).toBe('')
  })

  it('落点默认右上，两层都自报它', async () => {
    await mount({ count: 1 })
    expect(part('root')!.getAttribute('data-placement')).toBe('top-end')
    expect(part('indicator')!.getAttribute('data-placement')).toBe('top-end')

    await mount({ count: 1, placement: 'bottom-start' })
    expect(part('indicator')!.getAttribute('data-placement')).toBe('bottom-start')
  })

  it('给了整句就由它当可及名字：光念数字听不出这是什么', async () => {
    await mount({ count: 3, label: '3 条未读' })
    const indicator = part('indicator')!
    expect(indicator.getAttribute('aria-label')).toBe('3 条未读')
    expect(indicator.getAttribute('role')).toBe('status')
  })

  it('不再有 variant：标签面已经交回给 tag', async () => {
    await mount({ count: 1, variant: 'solid' } as Record<string, unknown>)
    // 传了也不会落成 data-variant——那一轴整个删掉了
    expect(part('indicator')!.getAttribute('data-variant')).toBeNull()
    expect(part('root')!.getAttribute('data-variant')).toBeNull()
  })
})
