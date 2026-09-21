// 目录里没放 indicator 部件时，当前那一节的链接自画一条静态指示线；放了部件就交给部件滑动、不重复画。
//
// 设计真源 §7.3 把 Tabs line / Anchor / NavigationMenu 归为同一类「透明面 + 2px 指示条」：作者不必为了
// 这条线多放一个部件。静态线画在当前链接的 ::after 上、贴链接盒内的那条缘：竖排贴行向起始缘（与 indicator
// 部件同侧，rtl 镜像）、横排贴块向末端（底边），主轴两端各退一格 --xh-space-1 避开链接的圆角；
// 厚度 / 颜色 / 圆角与 indicator 部件读同一组槽与缺省。
// 伪元素的几何与颜色只有真实 Chromium 算得出，jsdom 不算数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhAnchorIndicator, XhAnchorItem, XhAnchorLink, XhAnchorList, XhAnchorRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Orientation = 'horizontal' | 'vertical'
type Dir = 'ltr' | 'rtl'

let app: App | null = null
let host: HTMLElement | null = null

interface Mounted {
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
    render: () => h(XhAnchorRoot, { defaultValue: 'a', orientation, dir, smooth: false, style: { inlineSize: '240px' } }, () => [
      h(XhAnchorList, null, () => [
        h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'a' }, () => '概览')),
        h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'b' }, () => '安装')),
        withIndicator ? h(XhAnchorIndicator) : null,
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  const current = host.querySelector<HTMLElement>('[data-scope="anchor"][data-part="link"][data-value="a"]')!
  expect(current.getAttribute('data-current'), '默认值就是当前节').toBe('')
  return {
    list: host.querySelector<HTMLElement>('[data-scope="anchor"][data-part="list"]')!,
    current,
    rest: host.querySelector<HTMLElement>('[data-scope="anchor"][data-part="link"][data-value="b"]')!,
    indicator: host.querySelector<HTMLElement>('[data-scope="anchor"][data-part="indicator"]'),
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
  ['vertical', 'ltr'],
  ['vertical', 'rtl'],
  ['horizontal', 'ltr'],
  ['horizontal', 'rtl'],
])('%s / %s', (orientation, dir) => {
  it('没放 indicator 部件：当前链接自画静态线，贴缘、厚度颜色圆角同 indicator 的缺省；其余链接不画', async () => {
    const { list, current, rest } = await mount(orientation, dir, false)
    expect(list.querySelector('[data-part="indicator"]')).toBeNull()

    const line = after(current)
    expect(line.content, '当前链接的 ::after 是静态指示线').toBe('""')
    expect(line.position).toBe('absolute')
    expect(getComputedStyle(current).position, '线以链接盒为定位参照').toBe('relative')
    expect(line.backgroundColor).toBe(resolveColor('--xh-fg-brand', list))
    expect(Number.parseFloat(line.borderTopLeftRadius)).toBe(resolveLength('--xh-shape-pill', list))
    expect(line.pointerEvents).toBe('none')

    const thickness = resolveLength('--xh-stroke-thick', list)
    const clearance = resolveLength('--xh-space-1', list)
    if (orientation === 'vertical') {
      // 贴行向起始缘：ltr 在左、rtl 在右（与 indicator 部件同侧），两端各退一格避开圆角
      expect(Number.parseFloat(line.width)).toBe(thickness)
      expect(Number.parseFloat(line.top)).toBe(clearance)
      expect(Number.parseFloat(line.bottom)).toBe(clearance)
      expect(dir === 'ltr' ? line.left : line.right).toBe('0px')
      const farSide = Number.parseFloat(dir === 'ltr' ? line.right : line.left)
      expect(farSide).toBeCloseTo(current.clientWidth - thickness, 0)
    }
    else {
      // 贴底，两端各退一格避开圆角
      expect(Number.parseFloat(line.height)).toBe(thickness)
      expect(line.bottom).toBe('0px')
      expect(Number.parseFloat(line.left)).toBe(clearance)
      expect(Number.parseFloat(line.right)).toBe(clearance)
    }

    expect(after(rest).content, '非当前链接不画线').toBe('none')
  })

  it('放了 indicator 部件：由部件画线，当前链接不再自画', async () => {
    const { current, indicator } = await mount(orientation, dir, true)
    expect(indicator).not.toBeNull()
    expect(getComputedStyle(indicator!).display).not.toBe('none')
    expect(after(current).content, '有部件时不重复画').toBe('none')
  })

  it('静态线与 indicator 部件读同一组缺省：厚度、颜色、圆角逐项相等', async () => {
    const bare = await mount(orientation, dir, false)
    const line = after(bare.current)
    const snapshot = {
      thickness: orientation === 'vertical' ? line.width : line.height,
      color: line.backgroundColor,
      radius: line.borderTopLeftRadius,
    }
    app!.unmount()
    host!.remove()

    const withPart = await mount(orientation, dir, true)
    const part = getComputedStyle(withPart.indicator!)
    expect(snapshot).toEqual({
      thickness: orientation === 'vertical' ? part.width : part.height,
      color: part.backgroundColor,
      radius: part.borderTopLeftRadius,
    })
  })
})

describe('切换后静态线跟着当前节走', () => {
  it('点中另一条链接后，线从旧链接消失、出现在新链接上', async () => {
    const { current, rest } = await mount('vertical', 'ltr', false)
    expect(after(current).content).toBe('""')
    rest.click()
    await nextTick()
    expect(rest.getAttribute('data-current')).toBe('')
    expect(after(rest).content).toBe('""')
    expect(after(current).content).toBe('none')
  })
})
