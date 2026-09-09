// 每页条数控制器：装的是库里的 select，长相与全库其它下拉是同一个。
//
// 只有真实浏览器量得出来：皮肤在场与否、控件量出来多高、浮层落没落位，
// 三样都要真的算过样式与布局。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPaginationItem,
  XhPaginationPageSizeSelect,
  XhPaginationRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  // 浮层被搬到 body 上，卸载后落点里不该还剩东西
  for (const el of document.querySelectorAll('[data-scope="select"][data-part="positioner"]'))
    el.remove()
})

async function mount(props: Record<string, unknown> = {}) {
  host = document.createElement('div')
  document.body.append(host)

  app = createApp({
    setup: () => () =>
      h(XhPaginationRoot, { count: 196, defaultPageSize: 20, pageSizeOptions: [10, 20, 50], ...props }, () => [
        h(XhPaginationPageSizeSelect),
        h(XhPaginationItem, { value: 1 }, () => '1'),
      ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

/** 分页那一侧的部件。 */
function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="pagination"][data-part="${name}"]`)!
}

/** 内嵌下拉的角色节点。 */
function selectPart(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="select"][data-part="${name}"]`)!
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  // 落位是引擎在下一帧写回的
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

describe('每页条数控制器接的是库里的下拉', () => {
  it('控件吃的是 select 那份皮肤，不再是抹掉外观的原生下拉', async () => {
    await mount()
    const root = selectPart('root')
    // 皮肤在场的标记由 select.css 声明
    expect(getComputedStyle(root).getPropertyValue('--xh-select-skin').trim()).toBe('1')
    // 原生下拉整个不在了
    expect(document.querySelector('select')).toBeNull()

    const control = getComputedStyle(selectPart('control'))
    expect(Number.parseFloat(control.borderTopWidth)).toBeGreaterThan(0)
    expect(control.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

    // 展开指示符是 select 自己那枚箭头，不是系统下拉画的那个
    const indicator = getComputedStyle(selectPart('indicator'), '::before')
    expect(indicator.maskImage || indicator.webkitMaskImage).toContain('data:image/svg')
  })

  it('与页码格子等高同基线：换成下拉之后这一行没被撑歪', async () => {
    await mount()
    const control = selectPart('control').getBoundingClientRect()
    const item = part('item').getBoundingClientRect()

    expect(control.height).toBeCloseTo(item.height, 0)
    expect(control.top).toBeCloseTo(item.top, 0)
  })

  it('点开即落位：面板露面且不窄于触发器', async () => {
    await mount()
    selectPart('trigger').click()
    await settle()

    const positioner = selectPart('positioner')
    expect(positioner.getAttribute('data-state')).toBe('open')
    expect(positioner.hasAttribute('data-positioned')).toBe(true)

    const content = selectPart('content')
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(content.getBoundingClientRect().width)
      .toBeGreaterThanOrEqual(selectPart('trigger').getBoundingClientRect().width - 1)
  })

  it('收起时面板不占地方：闸门落成内联 display', async () => {
    await mount()
    expect(getComputedStyle(selectPart('content')).display).toBe('none')
  })

  it('挑一档即换档，触发器上的文字跟着换', async () => {
    await mount()
    expect(selectPart('value-text').textContent).toBe('20 / page')

    selectPart('trigger').click()
    await settle()
    const option = [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
      .find(el => el.getAttribute('data-value') === '50')!
    option.click()
    await settle()

    expect(selectPart('value-text').textContent).toBe('50 / page')
  })
})
