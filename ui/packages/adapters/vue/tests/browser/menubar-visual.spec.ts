import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from '../../src'
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
  // 指针挪回页面角落：下一个用例挂载时若指针仍停在某入口的位置上，Chromium 会补发一次 mousemove，
  // 掠过即切换展开项，用例还没开始菜单就换了
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
})

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

function trigger(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='${value}']`)!
}

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='item'][data-value='${value}']`)!
}

/** 挂一条两张菜单的菜单栏；tall 时「文件」菜单塞满条目并限高，逼出内部滚动。 */
async function mountMenubar(options: { tall?: boolean } = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  const fileItems = options.tall
    ? Array.from({ length: 40 }, (_, i) => h(XhMenubarItem, { value: `file-${i}` }, () => h(XhMenubarItemText, null, () => `条目 ${i}`)))
    : [
        h(XhMenubarItem, { value: 'new' }, () => [
          h(XhMenubarItemIndicator, null, () => '✓'),
          h(XhMenubarItemText, null, () => '新建'),
        ]),
        h(XhMenubarItem, { value: 'open' }, () => h(XhMenubarItemText, null, () => '打开')),
        h(XhMenubarItem, { value: 'blocked', disabled: true }, () => h(XhMenubarItemText, null, () => '不可用')),
      ]
  app = createApp({
    render: () => h(XhMenubarRoot, null, () => [
      h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
      h(XhMenubarPositioner, { value: 'file' }, () => h(
        XhMenubarContent,
        { style: options.tall ? { inlineSize: '200px', maxBlockSize: '160px' } : { inlineSize: '200px' } },
        () => fileItems,
      )),
      h(XhMenubarTrigger, { value: 'edit' }, () => '编辑'),
      h(XhMenubarPositioner, { value: 'edit' }, () => h(XhMenubarContent, { style: { inlineSize: '200px' } }, () => [
        h(XhMenubarItem, { value: 'copy' }, () => h(XhMenubarItemText, null, () => '复制')),
      ])),
    ]),
  })
  app.mount(host)
  await nextTick()
  // 用指针点开：之后由脚本搬到条目上的焦点不带 :focus-visible，与真实使用一致
  await userEvent.click(trigger('file'))
  await nextTick()
  await nextTick()
  for (const el of document.querySelectorAll<HTMLElement>('[data-scope="menubar"]:is([data-part="trigger"], [data-part="item"])'))
    el.style.transition = 'none'
}

describe('menubar 入口与条目（真源 §7.2 / §7.3 / §9.2）', () => {
  it('展开着的入口是与悬停同档的中性面，不用品牌淡底；按下只换面到 200、不缩放', async () => {
    await mountMenubar()
    const open = trigger('file')
    expect(open.dataset.state).toBe('open')
    // 入口接 Collection Item 的 nav 语境：展开着的那一张投影 data-in-path，面由家族给
    expect(open.getAttribute('data-xh-collection-context')).toBe('nav')
    expect(open.hasAttribute('data-in-path')).toBe(true)
    expect(getComputedStyle(open).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    // 打开中不加粗、不用品牌字色：菜单名静息就是 default 字
    expect(getComputedStyle(open).fontWeight).toBe('400')
    expect(getComputedStyle(open).color).toBe(resolve('--xh-fg-default', 'color'))
    expect(getComputedStyle(open).backgroundColor).not.toBe(resolve('--xh-bg-brand-subtle'))

    const before = open.getBoundingClientRect()
    await pressPointer(open)
    expect(open.matches(':active')).toBe(true)
    expect(getComputedStyle(open).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(open).scale).toBe('none')
    expect(open.getBoundingClientRect().width).toBe(before.width)
    await releasePointer(open)
  })

  it('收着的入口静息透明面 + default 字，悬停走白底承载的 100', async () => {
    await mountMenubar()
    const closed = trigger('edit')
    expect(closed.hasAttribute('data-in-path')).toBe(false)
    expect(getComputedStyle(closed).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(closed).color).toBe(resolve('--xh-fg-default', 'color'))
    await userEvent.hover(closed)
    expect(getComputedStyle(closed).backgroundColor).toBe(resolve('--xh-bg-subtle'))
  })

  it('条目接 Collection Item：悬停 100、按下 200 不缩放', async () => {
    await mountMenubar()
    const openItem = item('open')
    expect(openItem.getAttribute('data-xh-collection-context')).toBe('overlay')
    expect(getComputedStyle(openItem).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    // 菜单栏的条目不在指针划过时落焦：悬停面只由 :hover 给
    await userEvent.hover(openItem)
    expect(getComputedStyle(openItem).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    await pressPointer(openItem)
    expect(getComputedStyle(openItem).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(openItem).scale).toBe('none')
    await releasePointer(openItem)
  })

  it('禁用条目不悬停换底；标记位落 prefix 槽且盒尺随家族档 20px', async () => {
    await mountMenubar()
    const blocked = item('blocked')
    await userEvent.hover(blocked)
    expect(getComputedStyle(blocked).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(blocked).color).toBe(resolve('--xh-fg-disabled', 'color'))
    expect(getComputedStyle(blocked).cursor).toBe('not-allowed')
    const indicator = item('new').querySelector<HTMLElement>('[data-part="item-indicator"]')!
    expect(indicator.getAttribute('data-xh-collection-slot')).toBe('prefix')
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    expect(getComputedStyle(indicator).width).toBe('20px')
  })

  it('条目超过限高时菜单内部滚动：自绘条挂在这张菜单的 positioner 里、走 4px 档，原生条藏起，到底不穿透', async () => {
    await mountMenubar({ tall: true })
    const content = document.querySelector<HTMLElement>('[data-scope="menubar"][data-part="content"][data-state="open"]')!
    const positioner = content.parentElement!
    expect(positioner.getAttribute('data-part')).toBe('positioner')
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
    expect(getComputedStyle(content).overscrollBehaviorY).toBe('contain')
    expect(content.hasAttribute('data-xh-scrollbar')).toBe(true)
    const bar = positioner.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')
    expect(bar).not.toBeNull()
    expect(bar!.getAttribute('data-size')).toBe('sm')
    expect(getComputedStyle(positioner).getPropertyValue('--xh-scrollbar-track-bg').trim()).toBe('transparent')
  })
})
