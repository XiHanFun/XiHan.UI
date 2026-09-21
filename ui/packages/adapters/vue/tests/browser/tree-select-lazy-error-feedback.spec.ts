// 懒分支取数失败的那一行仍可激活（Enter / 点行触发重试），键盘焦点环、悬停底与按下底都不能为零。
//
// 家族 Collection Item 按 data-error 给的是告警面，且 hover / 高亮 / 按下三段都排除了 [data-error]；
// 树选择皮肤把告警面映射回常态后，这三段反馈必须由皮肤在 error 行上重新接回。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function query(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el)
    throw new Error(`找不到 ${selector}`)
  return el
}

/** 把语义令牌解析成与 getComputedStyle 同格式的颜色值。 */
function resolveColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function colorAlpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mousePressed(element: HTMLElement, type: 'mousePressed' | 'mouseReleased'): Promise<void> {
  const rect = element.getBoundingClientRect()
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    button: 'left',
    buttons: type === 'mousePressed' ? 1 : 0,
    clickCount: 1,
  })
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('树选择懒分支取数失败行的反馈', () => {
  it.each(['light', 'dark'] as const)('%s：error 行保留焦点环、悬停底与按下底，光标仍为可点', async (theme) => {
    host = document.createElement('div')
    host.dataset.theme = theme
    document.body.append(host)
    app = createApp({ render: () => h(XhTreeSelectRoot, {
      collection: [
        { value: 'remote', label: '远程目录', hasChildren: true },
        { value: 'other', label: '另一目录', hasChildren: true },
      ],
      loadChildren: () => Promise.reject(new Error('取数失败')),
      open: true,
    }) })
    app.mount(host)
    await settle()

    const branch = query(`[data-scope='tree-select'][data-part='branch'][data-value='remote']`)
    const control = query(`[data-scope='tree-select'][data-part='branch'][data-value='remote'] > [data-part='branch-control']`)
    const otherTrigger = query(`[data-scope='tree-select'][data-part='branch'][data-value='other'] [data-part='branch-trigger']`)
    query(`[data-scope='tree-select'][data-part='branch'][data-value='remote'] [data-part='branch-trigger']`).click()
    await expect.poll(() => control.hasAttribute('data-error')).toBe(true)
    // 展开把锚点落到了这一行，把锚点挪到另一分支后再看静息面
    otherTrigger.click()
    await settle()
    control.style.transition = 'none'
    expect(control.hasAttribute('data-highlighted')).toBe(false)

    // 静息：取数失败不预设告警面，与常态行同底同字色，光标保持可点
    expect(colorAlpha(getComputedStyle(control).backgroundColor)).toBe(0)
    expect(getComputedStyle(control).color).toBe(resolveColor('--xh-material-frosted-fg'))
    expect(getComputedStyle(control).cursor).toBe('pointer')

    // 键盘焦点：环画在行上且颜色是焦点环色，底走高亮 100 档
    await userEvent.tab()
    branch.focus()
    await settle()
    expect(branch.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(control).outlineStyle).toBe('solid')
    expect(getComputedStyle(control).outlineColor).toBe(resolveColor('--xh-ring-focus'))
    expect(colorAlpha(getComputedStyle(control).outlineColor)).toBeGreaterThan(0)
    expect(getComputedStyle(control).backgroundColor).toBe(resolveColor('--xh-bg-subtle'))

    // 指针：把锚点再挪走，悬停 100 档、按下 200 档
    branch.blur()
    otherTrigger.click()
    await settle()
    expect(control.hasAttribute('data-highlighted')).toBe(false)
    expect(colorAlpha(getComputedStyle(control).backgroundColor)).toBe(0)
    await userEvent.hover(control)
    await expect.poll(() => getComputedStyle(control).backgroundColor).toBe(resolveColor('--xh-bg-subtle'))
    await mousePressed(control, 'mousePressed')
    expect(control.matches(':active')).toBe(true)
    expect(getComputedStyle(control).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover'))
    await mousePressed(control, 'mouseReleased')
  })
})
