// 树懒分支取数失败时的反馈行：说明与重试钮排在子层的位置，首格与同深度子行的首格对齐，两种主题下都看得见。
//
// 只有真实浏览器量得出来：缩进靠子层容器与反馈行的内边距实际排布，伪元素字形的颜色也要真解析出来。
//
// 取数相位只写在 branch 与反馈部件上，不进控制行：集合条目家族按行上的 data-error 换告警面并收掉悬停，
// 失败的那一行与常态分支行要同一悬停底，仍能点、能按确认键重试。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTreeRoot } from '../../src'
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
  probe.style.color = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

/** 行盒内容区的行首坐标：边框盒左缘加上行首内边距。 */
function contentStart(el: HTMLElement): number {
  return el.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(el).paddingInlineStart)
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('树懒分支的反馈行', () => {
  it.each(['light', 'dark'] as const)('%s：失败说明与重试钮按子层缩进排布，重试后换成子项', async (theme) => {
    let calls = 0
    host = document.createElement('div')
    host.dataset.theme = theme
    host.style.inlineSize = '320px'
    document.body.append(host)
    app = createApp({ render: () => h(XhTreeRoot, {
      collection: [
        { value: 'local', label: '本地目录', children: [{ value: 'sub', label: '子目录', children: [{ value: 'leaf', label: '文件' }] }] },
        { value: 'remote', label: '远程目录', hasChildren: true },
      ],
      defaultExpandedValue: ['local', 'remote'],
      label: '文件',
      loadChildren: () => {
        calls += 1
        return calls === 1
          ? Promise.reject(new Error('取数失败'))
          : Promise.resolve([{ value: 'remote-a', label: '远程文件' }])
      },
    }) })
    app.mount(host)

    const remote = query(`[data-scope='tree'][data-part='branch'][data-value='remote']`)
    await expect.poll(() => remote.hasAttribute('data-error')).toBe(true)
    await settle()

    const error = query(`[data-scope='tree'][data-part='branch'][data-value='remote'] > [data-part='branch-error']`)
    const retry = query(`[data-scope='tree'][data-part='branch'][data-value='remote'] > [data-part='branch-retry-trigger']`)
    const control = query(`[data-scope='tree'][data-part='branch'][data-value='remote'] > [data-part='branch-control']`)
    const localControl = query(`[data-scope='tree'][data-part='branch'][data-value='local'] > [data-part='branch-control']`)
    const childControl = query(`[data-scope='tree'][data-part='branch'][data-value='sub'] > [data-part='branch-control']`)
    const childTrigger = query(`[data-scope='tree'][data-part='branch'][data-value='sub'] [data-part='branch-trigger']`)

    // 失败说明与重试钮都在、且有实际尺寸；在途与为空两行收起
    expect(error.hidden).toBe(false)
    expect(retry.hidden).toBe(false)
    expect(query(`[data-scope='tree'][data-part='branch'][data-value='remote'] > [data-part='branch-loading']`).hidden).toBe(true)
    expect(query(`[data-scope='tree'][data-part='branch'][data-value='remote'] > [data-part='branch-empty']`).hidden).toBe(true)
    expect(error.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(retry.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(error.textContent).toContain('Could not load children')
    expect(retry.textContent).toBe('Retry')

    // 缩进：说明的警示字形与重试钮都落在同深度子行首格（子分支的展开箭头）的位置
    const childStart = childTrigger.getBoundingClientRect().left
    expect(Math.abs(contentStart(error) - childStart)).toBeLessThanOrEqual(1)
    expect(Math.abs(retry.getBoundingClientRect().left - childStart)).toBeLessThanOrEqual(1)
    expect(Math.abs(contentStart(childControl) - childStart)).toBeLessThanOrEqual(1)
    // 重试钮排在说明下方，不与控制行或说明重叠
    expect(error.getBoundingClientRect().top).toBeGreaterThanOrEqual(control.getBoundingClientRect().bottom - 0.5)
    expect(retry.getBoundingClientRect().top).toBeGreaterThanOrEqual(error.getBoundingClientRect().bottom - 0.5)

    // 颜色：说明走弱化字色、字形走危险色、重试钮走品牌色，两种主题都真解析出非透明值
    expect(getComputedStyle(error).color).toBe(resolveColor('--xh-fg-muted'))
    expect(getComputedStyle(error, '::before').backgroundColor).toBe(resolveColor('--xh-fg-danger'))
    expect(getComputedStyle(retry).color).toBe(resolveColor('--xh-fg-brand'))
    expect(getComputedStyle(retry).cursor).toBe('pointer')

    // 失败的控制行不带取数相位，悬停底与常态分支行一致
    expect(control.hasAttribute('data-error')).toBe(false)
    control.style.transition = 'none'
    localControl.style.transition = 'none'
    await userEvent.hover(localControl)
    await settle()
    const restHover = getComputedStyle(localControl).backgroundColor
    await userEvent.hover(control)
    await expect.poll(() => getComputedStyle(control).backgroundColor).toBe(restHover)
    expect(getComputedStyle(control).cursor).toBe('pointer')

    // 点重试：失败两行收起，取回的子项接在子层里
    await userEvent.click(retry)
    await expect.poll(() => document.querySelector(`[data-scope='tree'][data-part='item'][data-value='remote-a']`)).not.toBeNull()
    await settle()
    expect(remote.hasAttribute('data-error')).toBe(false)
    expect(error.hidden).toBe(true)
    expect(retry.hidden).toBe(true)
    expect(calls).toBe(2)
  })
})
