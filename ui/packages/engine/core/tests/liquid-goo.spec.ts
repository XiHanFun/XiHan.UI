// @vitest-environment jsdom
// 液态组：分离姿态随进度从源块中心长到原位、淡入晚于位移；粘连滤镜先筛出本体、收出整体外形，
// 再沿外形铺投影、底色、细线与两道亮边，亮边朝向跟光源；组跟着材质轴开关——在场时宿主最前面插入
// 滤镜与色块层、源块的读数同步给它们与墨色域，撤出时全部撤回。
import { afterEach, describe, expect, it } from 'vitest'
import { trackLiquidGoo } from '../src/visual-environment'
import { createGooFilter, GOO_BLUR, lightGooFilter, splitPose } from '../src/visual-environment/liquid/goo'

const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute('data-material')
})

describe('splitPose', () => {
  it('进度 0 时缩在源块中心、完全透明；1 时回到原位', () => {
    expect(splitPose(0, { x: 0, y: 56 })).toEqual({ translate: '0px 56px', scale: 0.6, opacity: 0 })
    expect(splitPose(1, { x: 0, y: 56 })).toEqual({ translate: '0px 0px', scale: 1, opacity: 1 })
  })

  it('淡入晚于位移：走完一半时还没完全浮上来', () => {
    const half = splitPose(0.5, { x: 0, y: 56 })
    expect(half.translate).toBe('0px 28px')
    expect(half.opacity).toBeLessThan(1)
    expect(half.opacity).toBeGreaterThan(0)
  })

  it('弹簧超调时位移冲过头，缩放封顶在 1', () => {
    const over = splitPose(1.05, { x: 0, y: 56 })
    expect(over.translate).toBe('0px -2.8px')
    expect(over.scale).toBe(1)
    expect(over.opacity).toBe(1)
  })
})

describe('createGooFilter', () => {
  it('筛出本体 → 模糊收边成整体外形；四段填色交给皮肤；投影垫底、亮边在上', () => {
    const svg = createGooFilter(document, 'goo-test')
    expect(svg.hasAttribute('data-xh-liquid-goo-filter')).toBe(true)
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    const filter = svg.querySelector('filter#goo-test')!
    expect(filter.querySelector('feFuncA')!.getAttribute('tableValues')).toBe('0 0 0 0 0 0 0 0 0 1')
    expect(filter.querySelector('feGaussianBlur')!.getAttribute('stdDeviation')).toBe(String(GOO_BLUR))
    expect(filter.querySelector('feColorMatrix')!.getAttribute('values')).toContain('22 -9')
    const paints = [...filter.querySelectorAll('[data-xh-goo-paint]')].map(node => node.getAttribute('data-xh-goo-paint'))
    expect(paints).toEqual(['fill', 'edge', 'near', 'far'])
    const merged = [...filter.querySelectorAll('feMergeNode')].map(node => node.getAttribute('in'))
    expect(merged).toEqual(['shadow', 'fill', 'edge', 'near', 'far'])
  })

  it('亮边朝向：朝光一弯往背光方向挪，背光一弯反过来；缺省光源在左上', () => {
    const svg = createGooFilter(document, 'goo-light')
    const near = svg.querySelector('[data-xh-goo-shift="near"]')!
    const far = svg.querySelector('[data-xh-goo-shift="far"]')!
    expect([near.getAttribute('dx'), near.getAttribute('dy')]).toEqual(['0.71', '0.71'])
    expect([far.getAttribute('dx'), far.getAttribute('dy')]).toEqual(['-0.71', '-0.71'])
    lightGooFilter(svg, 1, 0)
    expect([near.getAttribute('dx'), near.getAttribute('dy')]).toEqual(['-1', '0'])
    expect([far.getAttribute('dx'), far.getAttribute('dy')]).toEqual(['1', '0'])
  })
})

describe('trackLiquidGoo', () => {
  function setup(): { host: HTMLElement, source: HTMLElement, list: HTMLElement, item: HTMLElement } {
    const host = document.createElement('div')
    const source = document.createElement('button')
    const list = document.createElement('div')
    const item = document.createElement('button')
    list.append(item)
    host.append(source, list)
    document.body.append(host)
    return { host, source, list, item }
  }

  it('材质轴为 liquid 时插入色块层并同步源块读数，改走时全部撤回', async () => {
    const { host, source, list, item } = setup()
    source.setAttribute('data-xh-ink', 'light')
    source.setAttribute('data-xh-liquid-clarity', 'clear')
    document.documentElement.setAttribute('data-material', 'liquid')
    const goo = trackLiquidGoo(host, { source, members: () => [source, item], domains: () => [list] })
    await frame()

    const [svg, layer] = [...host.children] as [SVGSVGElement, HTMLElement]
    expect(goo.active).toBe(true)
    expect(svg.hasAttribute('data-xh-liquid-goo-filter')).toBe(true)
    expect(layer.hasAttribute('data-xh-liquid-goo-layer')).toBe(true)
    expect(layer.getAttribute('aria-hidden')).toBe('true')
    expect(layer.style.filter).toContain(svg.querySelector('filter')!.id)
    expect(host.hasAttribute('data-xh-liquid-goo')).toBe(true)
    for (const target of [layer, svg, list]) {
      expect(target.getAttribute('data-xh-ink')).toBe('light')
      expect(target.getAttribute('data-xh-liquid-clarity')).toBe('clear')
    }

    document.documentElement.setAttribute('data-material', 'standard')
    await frame()
    await frame()
    expect(goo.active).toBe(false)
    expect(host.querySelector('[data-xh-liquid-goo-layer]')).toBeNull()
    expect(host.querySelector('[data-xh-liquid-goo-filter]')).toBeNull()
    expect(host.hasAttribute('data-xh-liquid-goo')).toBe(false)
    expect(list.hasAttribute('data-xh-ink')).toBe(false)
    goo.dispose()
  })

  it('不在场时 split 不播放：撤掉行内姿态，当场落定', async () => {
    const { host, source, item } = setup()
    item.setAttribute('data-xh-liquid-goo-split', '')
    item.style.opacity = '0'
    const goo = trackLiquidGoo(host, { source, members: () => [source, item] })
    await frame()
    expect(goo.animated).toBe(false)
    await expect(goo.split([item], true)).resolves.toBe('rest')
    expect(item.hasAttribute('data-xh-liquid-goo-split')).toBe(false)
    expect(item.style.opacity).toBe('')
    goo.dispose()
  })

  it('撤出后滤镜、色块层、宿主标记与滤镜库一并撤回', async () => {
    const { host, source, item } = setup()
    document.documentElement.setAttribute('data-material', 'liquid')
    const goo = trackLiquidGoo(host, { source, members: () => [source, item] })
    await frame()
    expect(goo.active).toBe(true)
    goo.dispose()
    goo.dispose()
    expect(host.querySelector('[data-xh-liquid-goo-layer]')).toBeNull()
    expect(host.querySelector('[data-xh-liquid-goo-filter]')).toBeNull()
    expect(host.hasAttribute('data-xh-liquid-goo')).toBe(false)
    expect(document.querySelector('svg[data-xh-liquid-lenses]')).toBeNull()
  })
})
