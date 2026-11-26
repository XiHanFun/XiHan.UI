// 菜单的分隔线：与条目的面齐平，上下各留 2px，几何与颜色都由 Collection Item 配方给。
//
// 条目的面随内容面的内衬内缩 4px；分隔线再往里缩一截（此前是 12px）就比悬停面短出两头，
// 一条线读成了一段装饰。三份皮肤只把各自的使用者槽桥到配方，不再各写 margin 与 background。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from '../../src'
import { tokenLength, tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
})

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 menu/${name}`)
  return element
}

describe('菜单分隔线', () => {
  it('menu：线的两端与条目的面齐平，上下各 2px', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhMenuRoot, { open: true }, () => [
        h(XhMenuTrigger, null, () => '打开'),
        h(XhMenuPositioner, null, () => h(XhMenuContent, { style: { inlineSize: '240px' } }, () => [
          h(XhMenuItem, { value: 'copy' }, () => '复制'),
          h(XhMenuSeparator),
          h(XhMenuItem, { value: 'paste' }, () => '粘贴'),
        ])),
      ]),
    })
    app.mount(host)
    await nextTick()
    await nextTick()

    const [before, after] = document.querySelectorAll<HTMLElement>(`[data-scope='menu'][data-part='item']`)
    const separator = part('separator')
    const line = separator.getBoundingClientRect()
    const row = before!.getBoundingClientRect()
    expect(line.left).toBeCloseTo(row.left, 1)
    expect(line.right).toBeCloseTo(row.right, 1)
    const gap = tokenLength('--xh-space-0_5')
    expect(line.top - row.bottom).toBeCloseTo(gap, 1)
    expect(after!.getBoundingClientRect().top - line.bottom).toBeCloseTo(gap, 1)
    expect(line.height).toBe(tokenLength('--xh-stroke-thin'))
    expect(getComputedStyle(separator).backgroundColor).toBe(tokenValue('background-color', '--xh-material-frosted-separator'))
  })

  it.each(['menu', 'context-menu', 'menubar'])('%s：强制色下线换成前景色画回来，不随底色一起被换成 Canvas', async (scope) => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    try {
      host = document.createElement('div')
      host.innerHTML = `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="separator" data-xh-collection-separator role="separator"></div><span style="color: CanvasText"></span>`
      document.body.append(host)
      const [line, ink] = host.children
      expect(getComputedStyle(line!).backgroundColor).toBe(getComputedStyle(ink!).color)
    }
    finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] })
    }
  })

  it.each(['menu', 'context-menu', 'menubar'])('%s：使用者槽经配方生效', (scope) => {
    host = document.createElement('div')
    // 分隔线由连接层投影配方的标记位；这里照投影写好，只验皮肤与配方的接线
    host.innerHTML = `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="separator" data-xh-collection-separator role="separator"></div>`
    host.style.setProperty(`--xh-${scope}-separator-my`, '6px')
    host.style.setProperty(`--xh-${scope}-separator-bg`, 'rgb(0, 128, 0)')
    host.style.setProperty(`--xh-${scope}-separator-thickness`, '3px')
    document.body.append(host)
    const style = getComputedStyle(host.firstElementChild!)
    expect(style.marginTop).toBe('6px')
    expect(style.marginBottom).toBe('6px')
    expect(style.marginLeft).toBe('0px')
    expect(style.marginRight).toBe('0px')
    expect(style.backgroundColor).toBe('rgb(0, 128, 0)')
    expect(style.height).toBe('3px')
  })
})
