// line 档没放 indicator 部件时，选中标签自画一条静态指示线；放了部件就交给部件滑动、不重复画。
//
// 用户裁决：横向缺省也要像纵向示例那样有一条选中线。静态线画在选中标签的 ::after 上，
// 横向贴块向末端（底边）、纵向贴行向末端（与 indicator 部件同侧，rtl 镜像），厚度 / 颜色 / 圆角与
// indicator 部件读同一组槽与缺省。伪元素的几何与颜色只有真实 Chromium 算得出，jsdom 不算数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Orientation = 'horizontal' | 'vertical'
type Dir = 'ltr' | 'rtl'

let app: App | null = null
let host: HTMLElement | null = null

interface Mounted {
  root: HTMLElement
  list: HTMLElement
  current: HTMLElement
  rest: HTMLElement
  indicator: HTMLElement | null
}

async function mount(orientation: Orientation, dir: Dir, withIndicator: boolean): Promise<Mounted> {
  host = document.createElement('div')
  host.setAttribute('dir', dir)
  document.body.append(host)
  app = createApp({
    render: () => h(XhTabsRoot, { defaultValue: 'a', orientation, dir, style: { inlineSize: '360px' } }, () => [
      h(XhTabsList, { 'aria-label': '视图' }, () => [
        h(XhTabsTrigger, { value: 'a' }, () => '概览'),
        h(XhTabsTrigger, { value: 'b' }, () => '分析'),
        withIndicator ? h(XhTabsIndicator) : null,
      ]),
      h(XhTabsContent, { value: 'a' }, () => '概览内容'),
      h(XhTabsContent, { value: 'b' }, () => '分析内容'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  return {
    root: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="root"]')!,
    list: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="list"]')!,
    current: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="trigger"][data-value="a"]')!,
    rest: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="trigger"][data-value="b"]')!,
    indicator: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="indicator"]'),
  }
}

/** 令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 令牌在该元素上解到的长度（px）。 */
function resolveLength(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.blockSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).height)
  probe.remove()
  return value
}

function after(element: HTMLElement): CSSStyleDeclaration {
  return getComputedStyle(element, '::after')
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe.each<[Orientation, Dir]>([
  ['horizontal', 'ltr'],
  ['horizontal', 'rtl'],
  ['vertical', 'ltr'],
  ['vertical', 'rtl'],
])('line 档 %s / %s', (orientation, dir) => {
  it('没放 indicator 部件：选中标签自画静态线，贴末端、厚度颜色圆角同 indicator 的缺省；未选中标签不画', async () => {
    const { list, current, rest } = await mount(orientation, dir, false)
    expect(list.querySelector('[data-part="indicator"]')).toBeNull()

    const line = after(current)
    expect(line.content, '选中标签的 ::after 是静态指示线').toBe('""')
    expect(line.position).toBe('absolute')
    expect(getComputedStyle(current).position, '线以标签盒为定位参照').toBe('relative')
    expect(line.backgroundColor).toBe(resolveColor('--xh-bg-brand', list))
    expect(Number.parseFloat(line.borderTopLeftRadius)).toBe(resolveLength('--xh-shape-pill', list))
    expect(line.pointerEvents).toBe('none')

    const thickness = resolveLength('--xh-stroke-thick', list)
    if (orientation === 'horizontal') {
      // 贴底、横贯整枚标签
      expect(Number.parseFloat(line.height)).toBe(thickness)
      expect(line.bottom).toBe('0px')
      expect(line.left).toBe('0px')
      expect(line.right).toBe('0px')
    }
    else {
      // 贴行向末端：ltr 在右、rtl 在左（与 indicator 部件同侧），纵贯整枚标签
      expect(Number.parseFloat(line.width)).toBe(thickness)
      expect(line.top).toBe('0px')
      expect(line.bottom).toBe('0px')
      expect(dir === 'ltr' ? line.right : line.left).toBe('0px')
      // 另一侧解出的是已用值：线贴在末端时它等于标签内宽减去线宽
      const farSide = Number.parseFloat(dir === 'ltr' ? line.left : line.right)
      expect(farSide).toBeCloseTo(current.clientWidth - thickness, 0)
    }

    expect(after(rest).content, '未选中标签不画线').toBe('none')
  })

  it('放了 indicator 部件：由部件画线，选中标签不再自画', async () => {
    const { current, indicator } = await mount(orientation, dir, true)
    expect(indicator).not.toBeNull()
    expect(getComputedStyle(indicator!).display).not.toBe('none')
    expect(after(current).content, '有部件时不重复画').toBe('none')
  })

  it('静态线与 indicator 部件读同一组缺省：厚度、颜色、圆角逐项相等', async () => {
    const bare = await mount(orientation, dir, false)
    const line = after(bare.current)
    const lineThickness = orientation === 'horizontal' ? line.height : line.width
    const snapshot = { thickness: lineThickness, color: line.backgroundColor, radius: line.borderTopLeftRadius }
    app!.unmount()
    host!.remove()

    const withPart = await mount(orientation, dir, true)
    const part = getComputedStyle(withPart.indicator!)
    expect(snapshot).toEqual({
      thickness: orientation === 'horizontal' ? part.height : part.width,
      color: part.backgroundColor,
      radius: part.borderTopLeftRadius,
    })
  })
})

describe('切换后静态线跟着当前页走', () => {
  it('点中另一枚标签后，线从旧标签消失、出现在新标签上', async () => {
    const { current, rest } = await mount('horizontal', 'ltr', false)
    expect(after(current).content).toBe('""')
    rest.click()
    await nextTick()
    expect(rest.getAttribute('data-current')).toBe('')
    expect(after(rest).content).toBe('""')
    expect(after(current).content).toBe('none')
  })
})

describe('card / segment 档不画静态线', () => {
  it.each(['card', 'segment'] as const)('%s 档的选中标签 ::after 为空', async (variant) => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTabsRoot, { defaultValue: 'a', variant }, () => [
        h(XhTabsList, null, () => [
          h(XhTabsTrigger, { value: 'a' }, () => '概览'),
          h(XhTabsTrigger, { value: 'b' }, () => '分析'),
        ]),
        h(XhTabsContent, { value: 'a' }, () => '概览内容'),
      ]),
    })
    app.mount(host)
    await nextTick()
    const current = host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="trigger"][data-value="a"]')!
    expect(current.getAttribute('data-current')).toBe('')
    expect(after(current).content).toBe('none')
  })
})
