// 气泡族（Popover、Popconfirm、HoverCard）的面与排版：三家共用同一套内衬、圆角、描边与投影，
// 标题与正文同一套字号。只有真实浏览器量得出内衬与两行文字之间的距离。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhHoverCardContent,
  XhHoverCardDescription,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Scope = 'popover' | 'popconfirm' | 'hover-card'
type Size = 'sm' | 'md' | 'lg'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(scope: Scope, name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${scope}/${name}`)
  return element
}

/** 在定位层里放一个探针，按气泡所在的主题解出某个颜色令牌。 */
function resolvedColor(scope: Scope, token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  part(scope, 'positioner').append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

const RENDER: Record<Scope, (size: Size) => VNode> = {
  'popover': size => h(XhPopoverRoot, { open: true, size }, () => [
    h(XhPopoverTrigger, null, () => '打开'),
    h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => [
      h(XhPopoverTitle, null, () => '同步设置'),
      h(XhPopoverDescription, null, () => '改动会在下次登录时生效。'),
      h(XhPopoverCloseTrigger, { 'aria-label': '关闭' }),
    ])),
  ]),
  'popconfirm': size => h(XhPopconfirmRoot, { open: true, size }, () => [
    h(XhPopconfirmTrigger, null, () => '删除'),
    h(XhPopconfirmPositioner, null, () => h(XhPopconfirmContent, null, () => [
      h(XhPopconfirmTitle, null, () => '删除这条记录？'),
      h(XhPopconfirmDescription, null, () => '删除后不可恢复。'),
      h(XhPopconfirmCancelTrigger, null, () => '取消'),
      h(XhPopconfirmConfirmTrigger, null, () => '删除'),
    ])),
  ]),
  'hover-card': size => h(XhHoverCardRoot, { open: true, size }, () => [
    h(XhHoverCardTrigger, null, () => '@xihan'),
    h(XhHoverCardPositioner, null, () => h(XhHoverCardContent, null, () => [
      h(XhHoverCardTitle, null, () => 'XiHan'),
      h(XhHoverCardDescription, null, () => '组件库维护者。'),
    ])),
  ]),
}

async function mount(scope: Scope, size: Size = 'md'): Promise<void> {
  const host = document.createElement('div')
  host.dataset.theme = 'light'
  host.style.cssText = 'padding: 160px'
  document.body.append(host)
  app = createApp({ render: () => RENDER[scope](size) })
  app.mount(host)
  await settle()
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

describe('气泡族的面与排版', () => {
  it.each(['popover', 'popconfirm', 'hover-card'] as const)('%s：内衬纵 12 横 16、浮层圆角、1px 描边与浮层投影', async (scope) => {
    await mount(scope)
    const content = getComputedStyle(part(scope, 'content'))

    expect(content.paddingTop).toBe('12px')
    expect(content.paddingBottom).toBe('12px')
    expect(content.paddingLeft).toBe('16px')
    expect(content.paddingRight).toBe('16px')
    expect(content.borderRadius).toBe('4px')
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderTopColor).toBe(resolvedColor(scope, '--xh-border-default'))
    expect(content.boxShadow).toContain('0px 4px 10px')
  })

  it.each(['popover', 'popconfirm', 'hover-card'] as const)('%s：标题 14px / 500 / 正文色，正文 14px / 次级色，两行相距 4px', async (scope) => {
    await mount(scope)
    const titleElement = part(scope, 'title')
    const descriptionElement = part(scope, 'description')
    const title = getComputedStyle(titleElement)
    const description = getComputedStyle(descriptionElement)

    expect(title.fontSize).toBe('14px')
    expect(title.fontWeight).toBe('500')
    expect(title.color).toBe(resolvedColor(scope, '--xh-fg-default'))
    expect(description.fontSize).toBe('14px')
    expect(description.color).toBe(resolvedColor(scope, '--xh-fg-muted'))
    const gap = descriptionElement.getBoundingClientRect().top - titleElement.getBoundingClientRect().bottom
    expect(gap).toBeCloseTo(4, 0)
  })

  it('popconfirm：两颗钮排在末行、与正文隔开 16px，彼此相距 8px', async () => {
    await mount('popconfirm')
    const description = part('popconfirm', 'description').getBoundingClientRect()
    const cancel = part('popconfirm', 'cancel-trigger').getBoundingClientRect()
    const confirm = part('popconfirm', 'confirm-trigger').getBoundingClientRect()

    expect(cancel.top - description.bottom).toBeCloseTo(16, 0)
    expect(confirm.top).toBeCloseTo(cancel.top, 0)
    expect(confirm.left - cancel.right).toBeCloseTo(8, 0)
  })

  it.each([
    ['sm', '8px', '12px'],
    ['lg', '16px', '20px'],
  ] as const)('尺寸档 %s：纵向内衬 %s、横向 %s，三家同档', async (size, py, px) => {
    for (const scope of ['popover', 'popconfirm', 'hover-card'] as const) {
      await mount(scope, size)
      const content = getComputedStyle(part(scope, 'content'))
      expect(content.paddingTop, scope).toBe(py)
      expect(content.paddingLeft, scope).toBe(px)
      app?.unmount()
      app = null
      document.body.innerHTML = ''
    }
  })
})
