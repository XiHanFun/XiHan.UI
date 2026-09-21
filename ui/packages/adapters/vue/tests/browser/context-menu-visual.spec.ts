import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
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
  // 指针挪回页面角落：下一个用例挂载时若指针仍停在某条目的位置上，Chromium 会补发一次 mousemove
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

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='item'][data-value='${value}']`)!
}

async function mountContextMenu(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhContextMenuRoot, null, () => [
      h(XhContextMenuTrigger, { style: { display: 'block', inlineSize: '200px', blockSize: '80px' } }, () => '右键目标'),
      h(XhContextMenuPositioner, null, () => h(XhContextMenuContent, { style: { inlineSize: '220px' } }, () => [
        h(XhContextMenuItem, { value: 'copy' }, () => [
          h(XhContextMenuItemIndicator, null, () => '✓'),
          h(XhContextMenuItemText, null, () => '复制'),
        ]),
        h(XhContextMenuItem, { value: 'paste' }, () => h(XhContextMenuItemText, null, () => '粘贴')),
        h(XhContextMenuItem, { value: 'blocked', disabled: true }, () => h(XhContextMenuItemText, null, () => '不可用')),
        h(XhContextMenuSub, { value: 'more', openOnHover: false }, () => [
          h(XhContextMenuSubTrigger, null, () => '更多'),
          h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
            h(XhMenuItem, { value: 'more-a' }, () => '子项'),
          ])),
        ]),
      ])),
    ]),
  })
  app.mount(host)
  await nextTick()
  // 用真实右键打开：之后由脚本搬到条目上的焦点不带 :focus-visible，与真实使用一致
  const trigger = document.querySelector<HTMLElement>('[data-scope="context-menu"][data-part="trigger"]')!
  await userEvent.click(trigger, { button: 'right' })
  await nextTick()
  await nextTick()
  for (const row of document.querySelectorAll<HTMLElement>('[data-scope="context-menu"][data-part="item"]'))
    row.style.transition = 'none'
}

describe('context-menu 条目接入 Collection Item（真源 §7.2 / §7.3 / §9.2）', () => {
  it('悬停 / 键盘锚点落 100，按下 200 且不缩放', async () => {
    await mountContextMenu()
    const paste = item('paste')
    expect(paste.getAttribute('data-xh-collection-context')).toBe('overlay')
    expect(getComputedStyle(paste).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(paste)
    expect(paste.hasAttribute('data-highlighted')).toBe(true)
    expect(getComputedStyle(paste).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    // 指针落焦不画环：家族配方的描边留在 solid，颜色由皮肤的指针路径槽置成透明
    expect(getComputedStyle(paste).outlineColor).toBe('rgba(0, 0, 0, 0)')

    const before = paste.getBoundingClientRect()
    await pressPointer(paste)
    expect(paste.matches(':active')).toBe(true)
    expect(getComputedStyle(paste).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(paste).scale).toBe('none')
    expect(paste.getBoundingClientRect().width).toBe(before.width)
    await releasePointer(paste)
  })

  it('禁用条目不悬停换底、字色降级、光标 not-allowed', async () => {
    await mountContextMenu()
    const blocked = item('blocked')
    await userEvent.hover(blocked)
    expect(getComputedStyle(blocked).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(blocked).color).toBe(resolve('--xh-fg-disabled', 'color'))
    expect(getComputedStyle(blocked).cursor).toBe('not-allowed')
  })

  it('子层开着的触发项报 data-in-path，落与悬停同档的中性面、不加粗；标记位落 prefix 槽且盒尺按指示符档 16px', async () => {
    await mountContextMenu()
    const more = item('more')
    const copy = item('copy')
    expect(more.getAttribute('aria-haspopup')).toBe('menu')
    expect(more.hasAttribute('data-in-path')).toBe(false)
    await userEvent.click(more)
    await nextTick()
    expect(more.getAttribute('aria-expanded')).toBe('true')
    expect(more.hasAttribute('data-in-path')).toBe(true)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
    expect(getComputedStyle(more).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(more).fontWeight).toBe(getComputedStyle(copy).fontWeight)
    expect(getComputedStyle(more).borderInlineStartWidth).toBe('0px')

    const indicator = copy.querySelector<HTMLElement>('[data-part="item-indicator"]')!
    expect(indicator.getAttribute('data-xh-collection-slot')).toBe('prefix')
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    // 标记位是指示符（§6.5）：与指示符档同尺，不随家族按档下发的 --xh-icon-size（20px）；字形尺寸的契约由 context-menu-glyph-size.spec 管
    expect(getComputedStyle(indicator).width).toBe('16px')
  })
})
