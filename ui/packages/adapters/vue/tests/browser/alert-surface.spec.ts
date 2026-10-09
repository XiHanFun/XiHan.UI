// Alert 的语气淡底面、文字层级与尾端操作依赖真实计算样式和布局。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhAlertAction,
  XhAlertCloseTrigger,
  XhAlertContent,
  XhAlertDescription,
  XhAlertIndicator,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from '../../src'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='alert'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 alert/${name}`)
  return element
}

function tokenColor(name: string, scope: HTMLElement = document.body): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  scope.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** 在某个部件里把长度表达式解析成像素：用来对账继承下来的字形尺寸槽。 */
function resolvedLength(scope: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  scope.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '520px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhAlertRoot, { tone: 'success', closable: true }, () => [
      h(XhAlertIndicator, null, () => '✓'),
      h(XhAlertContent, null, () => [
        h(XhAlertTitle, null, () => '保存成功'),
        h(XhAlertDescription, null, () => '更改已经生效。'),
      ]),
      h(XhAlertAction, null, () => h(XhButton, { size: 'sm' }, () => '查看')),
      h(XhAlertCloseTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('警告提示的表面与信息层级', () => {
  it('使用语气淡底面（透明边位、无影），彩色只落在底与图标上，标题取正文色', async () => {
    await mount()
    const root = part('root')

    expect(getComputedStyle(root).backgroundColor).toBe(tokenColor('--xh-_tone-subtle', root))
    expect(getComputedStyle(root).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(root).boxShadow).toBe('none')
    expect(getComputedStyle(part('indicator')).color).toBe(tokenColor('--xh-_tone-fg', root))
    expect(getComputedStyle(part('title')).color).toBe(tokenColor('--xh-fg-default'))
    expect(getComputedStyle(part('description')).color).toBe(tokenColor('--xh-fg-muted'))
  })

  it('文本留在必需内容列，操作与关闭入口排在尾端', async () => {
    await mount()
    const root = part('root').getBoundingClientRect()
    const content = part('content').getBoundingClientRect()
    const action = part('action').getBoundingClientRect()
    const close = part('close-trigger').getBoundingClientRect()

    expect(content.left).toBeLessThan(action.left)
    expect(action.right).toBeLessThanOrEqual(close.left)
    expect(close.right).toBeLessThanOrEqual(root.right)
    expect(part('content').childElementCount).toBe(2)
  })

  it('关闭钮走 icon ghost 档：sm 档正方盒、静息透明无影，悬停底沿语气淡底再升一档', async () => {
    await mount()
    const close = part('close-trigger')
    const rect = close.getBoundingClientRect()
    const style = getComputedStyle(close)

    expect(close.dataset.xhActionProfile).toBe('icon')
    expect(close.dataset.xhActionVariant).toBe('ghost')
    const sm = tokenLength('--xh-control-h-sm')
    expect(rect.width).toBe(sm)
    expect(rect.height).toBe(sm)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
    expect(style.color).toBe(tokenColor('--xh-fg-muted'))
    // 兜底叉形按钮档取 sm 字形（16px），root 上给指示符的是 md 档（20px）
    expect(getComputedStyle(close, '::before').width).toBe('16px')
    expect(resolvedLength(part('indicator'), 'var(--xh-icon-size)')).toBe(20)

    await userEvent.hover(close)
    await expect.poll(() => getComputedStyle(close).backgroundColor).toBe(tokenColor('--xh-_tone-subtle-hover', part('root')))
    expect(getComputedStyle(close).color).toBe(tokenColor('--xh-fg-default'))
  })
})
