import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCommandRoot } from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
})

/** 在宿主的主题下把令牌解析成最终值，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' | 'border-color' | 'box-shadow' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='command'][data-part='${name}']`)!
}

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='command'][data-part='item'][data-value='${value}']`)!
}

async function mount(options: { many?: boolean } = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  const collection = options.many
    ? Array.from({ length: 40 }, (_, i) => ({ value: `cmd-${i}`, label: `命令 ${i}` }))
    : [
        { value: 'open', label: '打开文档' },
        { value: 'save', label: '保存' },
        { value: 'blocked', label: '不可用', disabled: true },
      ]
  app = createApp({ render: () => h(XhCommandRoot, { defaultOpen: true, modal: false, collection }) })
  app.mount(host)
  await nextTick()
  await nextTick()
  for (const el of document.querySelectorAll<HTMLElement>('[data-scope="command"][data-part="item"]'))
    el.style.transition = 'none'
}

describe('command 面板与命令（真源 §6.3 / §7.3 / §8 / §9.2）', () => {
  it('面板是 overlay 圆角 + sheet 三件套：material-elevated 的边 / 底 / 影，边界由描边承担', async () => {
    await mount()
    const content = getComputedStyle(part('content'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderTopColor).toBe(resolve('--xh-material-elevated-border', 'border-color'))
    expect(content.backgroundColor).toBe(resolve('--xh-material-elevated-bg'))
    expect(content.boxShadow).toBe(resolve('--xh-material-elevated-shadow', 'box-shadow'))
    expect(content.borderTopLeftRadius).toBe(getComputedStyle(part('content')).borderTopLeftRadius)
    expect(Number.parseFloat(content.borderTopLeftRadius)).toBe(12)
  })

  it('活动候选与指针悬停同一档中性面、不画对号不留选中底；按下 200 不缩放', async () => {
    await mount()
    const open = item('open')
    const save = item('save')
    expect(open.getAttribute('data-xh-collection-context')).toBe('overlay')
    // 开场锚点落在首条：aria-selected 只是同档高亮
    expect(open.getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(open).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    // 命令从不承载焦点：高亮不画环（家族的环槽映成透明）
    expect(getComputedStyle(open).outlineColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(open, '::after').content).toBe('none')
    expect(getComputedStyle(save).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(save)
    await nextTick()
    expect(save.getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(save).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(open).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    const before = save.getBoundingClientRect()
    await pressPointer(save)
    expect(save.matches(':active')).toBe(true)
    expect(getComputedStyle(save).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(save).scale).toBe('none')
    expect(save.getBoundingClientRect().width).toBe(before.width)
    // 松手即执行并收起：按下面在松手前采
    await releasePointer(save)
  })

  it('禁用命令不悬停换底、字色降级、光标 not-allowed', async () => {
    await mount()
    const blocked = item('blocked')
    await userEvent.hover(blocked)
    expect(getComputedStyle(blocked).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(blocked).color).toBe(resolve('--xh-fg-disabled', 'color'))
    expect(getComputedStyle(blocked).cursor).toBe('not-allowed')
  })

  it('命令超过面板限高时列表内部滚动：自绘条挂在面板里、走 4px 档，原生条藏起，到底不穿透', async () => {
    await mount({ many: true })
    const list = part('list')
    const content = part('content')
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight)
    expect(getComputedStyle(list).overscrollBehaviorY).toBe('contain')
    expect(list.hasAttribute('data-xh-scrollbar')).toBe(true)
    const bar = content.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')
    expect(bar).not.toBeNull()
    expect(bar!.getAttribute('data-size')).toBe('sm')
    expect(getComputedStyle(content).getPropertyValue('--xh-scrollbar-track-bg').trim()).toBe('transparent')
  })
})
