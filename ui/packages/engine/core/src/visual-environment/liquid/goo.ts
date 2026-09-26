/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 液态组：同一宿主里的几块液态面共用一层色块，靠得够近的块边缘像液体一样连起来。
//
// 色块层是库生成的装饰节点（aria-hidden，不接指针），插在宿主最前面、压在各块之下：每块一个色块，
// 跟着块的盒子、圆角与变换走。色块层套一段 SVG 粘连滤镜，只取色块的轮廓：高斯模糊把相邻色块的边缘
// 晕开连成一片，alpha 通道 ×22 − 9 再把晕开的边收成一条干净的边，与色块本身合起来就是整组的外形。
// 液态面的底色、墨色细线、朝光的 1px 亮边与投影都沿这个整体外形画——连起来的液桥也有边，看得出是一整块
// 液体，投影也不会落进液桥里；块自己在组里只留图标、文字与磨砂。
//
// 滤镜放在色块层旁边自己的 <svg> 中（放进色块层里会被当成自我引用而整段失效），各段填色用 CSS 取
// 液态令牌：<svg> 与色块层同在宿主里，并同步源块的墨色域与通透档，颜色随主题、对比档与色调切换，
// 不必由脚本重读。亮边朝向跟源块的光源方向走。
//
// 分离与融回：split(items, open) 让 items 从源块中分出来，或融回源块。每块一支弹簧（merge 预设），
// 离源块近的先动，相邻两块错开交错步长；位移、缩放与淡入写成块的行内 translate / scale / opacity，
// 分离落定后撤掉；融回落定后留着（块已经缩进源块、完全透明），等宿主把它们藏起来。
// 接管期间块带 data-xh-liquid-goo-split，皮肤据此停掉块自己的 CSS 进场动画。
// 减弱动效下不分离，直接落到终态。

import type { SpringValue, SpringValueSettle } from '@xihan-ui/motion'
import { createSpringValue, frameLoop, readMotion, resolveMotionPreference } from '@xihan-ui/motion'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 粘连滤镜 id 的前缀：每组一段，放在自己的色块层里。 */
export const GOO_FILTER_PREFIX = 'xh-liquid-goo-'
/** 模糊半径（px）：两块边缘相距约 1.6 倍以内就连起来。 */
export const GOO_BLUR = 9
/** 细线与亮边的宽度（px），与 --xh-stroke-thin 同值。 */
const STROKE = 1
/** 滤镜里取液态令牌填色的几段：底色、墨色细线、朝光亮边、背光弱亮边。 */
export type GooPaint = 'fill' | 'edge' | 'near' | 'far'
/** 宿主上的标记：色块层在场，块自己的面换成透明、底色交给色块层画。 */
export const GOO_HOST_ATTR = 'data-xh-liquid-goo'
/** 色块层自己的标记。 */
export const GOO_LAYER_ATTR = 'data-xh-liquid-goo-layer'
/** 装粘连滤镜的 <svg> 的标记：皮肤据此给滤镜各段填色。 */
export const GOO_FILTER_ATTR = 'data-xh-liquid-goo-filter'
/**
 * 进出场已由液态组接管的块：皮肤据此停掉它的 CSS 进场动画，姿态全由弹簧写。分离落定后标记留着——
 * 撤掉的话 CSS 进场动画会当场重播一遍；组失效或减弱动效下不接管时才撤。
 */
export const GOO_SPLIT_ATTR = 'data-xh-liquid-goo-split'
/** 分离起点的缩放：块从源块中心以这个比例冒出来。 */
const SPLIT_SCALE = 0.6
/** 连续这么多帧色块没变就停下逐帧跟随，等下一次唤醒。 */
const SETTLE_FRAMES = 3
/** 从源块同步给色块层与墨色域的读数：色调（墨色域）与通透档。 */
const READING_ATTRS = ['data-xh-ink', 'data-xh-liquid-clarity'] as const
/** 皮肤缺省的光源方向：左上方。 */
const DEFAULT_LIGHT = -0.71

let nextFilter = 0

export interface LiquidGooOptions {
  /** 这一组的液态块。色块逐个跟着它们的盒子、圆角与变换走；块被藏起来时色块随之隐去。 */
  members: () => readonly HTMLElement[]
  /** 读下层的那一块（已挂进液态面）：它读到的色调与通透档同步给色块层与 domains。 */
  source: HTMLElement
  /** 与源块共用同一次读数的墨色域，例如装着其余块的容器：块上的图标与文字据此取前景色。 */
  domains?: () => readonly HTMLElement[]
}

export interface LiquidGoo {
  /** 材质轴为 liquid、色块层在场。 */
  readonly active: boolean
  /** 在场且没有减弱动效：split 会播放，调用方可以据此把收起的内容留到融回结束。 */
  readonly animated: boolean
  /**
   * open 为真时 items 从源块中分出来，为假时融回源块；按离源块由近到远错开。
   * 全部落定时以 'rest' 结算，被新的 split 或撤出打断时以 'interrupted' 结算。
   * 不在场或减弱动效下不播放：撤掉行内姿态，当场以 'rest' 结算。
   */
  split: (items: readonly HTMLElement[], open: boolean) => Promise<SpringValueSettle>
  /** 撤出：色块层、宿主标记、同步过的读数与行内姿态一并撤回。幂等。 */
  dispose: () => void
}

/** 协调器持有的一组：生效与否、读数同步与唤醒由协调器驱动。 */
export interface GooGroup {
  readonly host: HTMLElement
  readonly source: HTMLElement
  readonly api: LiquidGoo
  includes: (el: Element) => boolean
  setActive: (active: boolean) => void
  mirror: () => void
  wake: () => void
}

function round(value: number, digits = 2): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function primitive(doc: Document, tag: string, attrs: Record<string, string | number>): SVGElement {
  const el = doc.createElementNS(SVG_NS, tag)
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, String(value))
  return el
}

/**
 * 一段粘连滤镜，装在不占位、读屏看不到的 <svg> 里。色块是不透明的，外面带着皮肤给的液态投影：
 *
 *   本体   只留 alpha 接近 1 的部分，把半透明的投影筛掉
 *   轮廓   本体模糊 → alpha ×22 − 9 收边，再与本体取并集（块的圆角保持锐利）
 *   投影   色块连同投影减去轮廓：投影只留在整组外形之外，不落进液桥
 *   底色   液态色调按通透档的不透明度铺满轮廓
 *   细线   轮廓减去向内收 1px 的轮廓，得到贴边的一圈，铺墨色细线
 *   亮边   轮廓减去朝背光方向挪 1px 的轮廓，露出朝光源的一弯；反过来挪得到背光一侧的弱亮边
 *
 * 各段的颜色由皮肤按 data-xh-goo-paint 取液态令牌，挪动方向由 lightGooFilter 按光源写。
 */
export function createGooFilter(doc: Document, id: string): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg')
  svg.setAttribute(GOO_FILTER_ATTR, '')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('style', 'position: absolute; inline-size: 0; block-size: 0; overflow: hidden')
  // 投影与亮边在轮廓外侧还要留出余地；缺省的 linearRGB 会让晕开的边缘偏暗
  const filter = primitive(doc, 'filter', { 'id': id, 'x': '-10%', 'y': '-10%', 'width': '120%', 'height': '120%', 'color-interpolation-filters': 'sRGB' })
  const paint = (name: GooPaint, result: string): SVGElement => {
    const flood = primitive(doc, 'feFlood', { result })
    flood.setAttribute('data-xh-goo-paint', name)
    return flood
  }
  const solid = primitive(doc, 'feComponentTransfer', { in: 'SourceAlpha', result: 'solid' })
  // alpha 不到 0.9 的一律归零：投影最浓也只到 0.6，块的本体是 1
  solid.append(primitive(doc, 'feFuncA', { type: 'discrete', tableValues: '0 0 0 0 0 0 0 0 0 1' }))
  filter.append(
    solid,
    primitive(doc, 'feGaussianBlur', { in: 'solid', stdDeviation: GOO_BLUR, result: 'blurred' }),
    primitive(doc, 'feColorMatrix', { in: 'blurred', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 22 -9', result: 'goo' }),
    primitive(doc, 'feComposite', { in: 'solid', in2: 'goo', operator: 'over', result: 'shape' }),
    primitive(doc, 'feComposite', { in: 'SourceGraphic', in2: 'shape', operator: 'out', result: 'shadow' }),
    paint('fill', 'tint'),
    primitive(doc, 'feComposite', { in: 'tint', in2: 'shape', operator: 'in', result: 'fill' }),
    primitive(doc, 'feMorphology', { in: 'shape', operator: 'erode', radius: STROKE, result: 'inner' }),
    primitive(doc, 'feComposite', { in: 'shape', in2: 'inner', operator: 'out', result: 'ring' }),
    paint('edge', 'edge-color'),
    primitive(doc, 'feComposite', { 'in': 'edge-color', 'in2': 'ring', 'operator': 'in', 'result': 'edge', 'data-xh-goo-band': 'edge' }),
    primitive(doc, 'feOffset', { 'in': 'shape', 'result': 'toward-dark', 'data-xh-goo-shift': 'near' }),
    primitive(doc, 'feComposite', { in: 'shape', in2: 'toward-dark', operator: 'out', result: 'near-band' }),
    paint('near', 'near-color'),
    primitive(doc, 'feComposite', { in: 'near-color', in2: 'near-band', operator: 'in', result: 'near' }),
    primitive(doc, 'feOffset', { 'in': 'shape', 'result': 'toward-light', 'data-xh-goo-shift': 'far' }),
    primitive(doc, 'feComposite', { in: 'shape', in2: 'toward-light', operator: 'out', result: 'far-band' }),
    paint('far', 'far-color'),
    primitive(doc, 'feComposite', { in: 'far-color', in2: 'far-band', operator: 'in', result: 'far' }),
  )
  const merge = primitive(doc, 'feMerge', {})
  for (const layer of ['shadow', 'fill', 'edge', 'near', 'far'])
    merge.append(primitive(doc, 'feMergeNode', { in: layer }))
  filter.append(merge)
  svg.append(filter)
  lightGooFilter(svg, DEFAULT_LIGHT, DEFAULT_LIGHT)
  return svg
}

/**
 * 按光源方向（单位向量，指向光源）写亮边的挪动：朝光一弯挪向背光方向，背光一弯反过来。
 * 与液态面上 1px 亮边的两层内阴影同一套几何。
 */
export function lightGooFilter(svg: SVGSVGElement, x: number, y: number): void {
  const near = svg.querySelector('[data-xh-goo-shift="near"]')
  const far = svg.querySelector('[data-xh-goo-shift="far"]')
  near?.setAttribute('dx', String(round(-x * STROKE, 3)))
  near?.setAttribute('dy', String(round(-y * STROKE, 3)))
  far?.setAttribute('dx', String(round(x * STROKE, 3)))
  far?.setAttribute('dy', String(round(y * STROKE, 3)))
}

/**
 * 分离进度 → 块的姿态。progress 0 时块缩在源块中心，1 时回到自己的位置；弹簧超调时越过 1，
 * 位移随之冲过头再回来，缩放封顶在 1。offset 是块中心指向源块中心的向量。
 * 淡入晚于位移：刚冒头时块还埋在源块的色块里，先让色块长出去，块的图标与细线再浮上来。
 */
export function splitPose(progress: number, offset: { x: number, y: number }): { translate: string, scale: number, opacity: number } {
  const away = 1 - progress
  const clamped = Math.min(1, Math.max(0, progress))
  return {
    translate: `${round(offset.x * away)}px ${round(offset.y * away)}px`,
    scale: round(SPLIT_SCALE + (1 - SPLIT_SCALE) * clamped, 4),
    opacity: round(Math.min(1, Math.max(0, (progress - 0.2) / 0.5)), 3),
  }
}

/** 元素的布局盒在宿主里的位置（不含变换）：沿 offsetParent 链累加，链没走到宿主时按视口矩形退算。 */
export function offsetWithin(el: HTMLElement, host: HTMLElement): { x: number, y: number } {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== host) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  if (node === host)
    return { x, y }
  const rect = el.getBoundingClientRect()
  const origin = host.getBoundingClientRect()
  return { x: rect.left - origin.left - host.clientLeft, y: rect.top - origin.top - host.clientTop }
}

function centerWithin(el: HTMLElement, host: HTMLElement): { x: number, y: number } {
  const at = offsetWithin(el, host)
  return { x: at.x + el.offsetWidth / 2, y: at.y + el.offsetHeight / 2 }
}

interface Split {
  spring: SpringValue
  offset: { x: number, y: number }
  timer: number
}

/** 建一组；由协调器按材质轴开关，按源块的读数同步。 */
export function createGooGroup(
  host: HTMLElement,
  options: LiquidGooOptions,
  win: Window,
  onDispose: (group: GooGroup) => void,
): GooGroup {
  const doc = host.ownerDocument
  const filterId = `${GOO_FILTER_PREFIX}${++nextFilter}`
  let layer: HTMLElement | null = null
  let filter: SVGSVGElement | null = null
  let disposed = false
  const blobs = new Map<HTMLElement, { el: HTMLElement, text: string }>()
  const splits = new Map<HTMLElement, Split>()

  const blobText = (member: HTMLElement): string => {
    if (!layer || !member.isConnected || member.getClientRects().length === 0)
      return 'display: none'
    const at = offsetWithin(member, host)
    const style = win.getComputedStyle(member)
    return `left: ${at.x - layer.offsetLeft}px; top: ${at.y - layer.offsetTop}px; `
      + `width: ${member.offsetWidth}px; height: ${member.offsetHeight}px; `
      + `border-radius: ${style.borderTopLeftRadius}; transform-origin: ${style.transformOrigin}; `
      + `translate: ${style.translate}; rotate: ${style.rotate}; scale: ${style.scale}; transform: ${style.transform}`
  }

  /** 让一块的色块跟上它此刻的盒子与变换；返回写下的样式串。 */
  const follow = (member: HTMLElement): string => {
    if (!layer)
      return ''
    let blob = blobs.get(member)
    if (!blob) {
      blob = { el: doc.createElement('span'), text: '' }
      layer.append(blob.el)
      blobs.set(member, blob)
    }
    const text = blobText(member)
    if (text !== blob.text) {
      blob.el.style.cssText = text
      blob.text = text
    }
    return text
  }

  /** 全组量一遍：多出来的色块撤掉，其余逐个跟上。返回全组的样式串，用来判断是否已经静止。 */
  const measure = (): string => {
    const members = options.members()
    for (const [member, blob] of blobs) {
      if (!members.includes(member)) {
        blob.el.remove()
        blobs.delete(member)
      }
    }
    let signature = ''
    for (const member of members)
      signature += `${follow(member)}|`
    return signature
  }

  // 逐帧跟随：块在过渡、动画或被按住形变时唤醒，连续几帧没变就停下
  let stopFollow: VoidFunction | null = null
  let still = 0
  let signature = ''
  const halt = (): void => {
    stopFollow?.()
    stopFollow = null
  }
  const step = (): void => {
    const next = measure()
    if (next === signature) {
      still++
    }
    else {
      signature = next
      still = 0
    }
    if (still >= SETTLE_FRAMES)
      halt()
  }
  const wake = (): void => {
    still = 0
    if (layer && !stopFollow)
      stopFollow = frameLoop(win, step)
  }

  const resizer = typeof ResizeObserver === 'function' ? new ResizeObserver(wake) : null
  // 块增减、展开组显隐与块上的样式变化都要跟：色块层自己的写入不算
  const mutations = typeof MutationObserver === 'function'
    ? new MutationObserver((records) => {
        if (records.some(record => !layer?.contains(record.target) && !filter?.contains(record.target)))
          wake()
      })
    : null
  const WAKE_EVENTS = ['transitionrun', 'transitionend', 'animationstart', 'animationend', 'pointerdown', 'pointerup', 'pointercancel'] as const

  /** 撤掉一块的行内姿态；handOver 时连接管标记一起撤，进出场交还给皮肤。 */
  const clearPose = (item: HTMLElement, handOver: boolean): void => {
    const split = splits.get(item)
    if (split) {
      win.clearTimeout(split.timer)
      split.spring.stop()
      splits.delete(item)
    }
    if (handOver)
      item.removeAttribute(GOO_SPLIT_ATTR)
    item.style.removeProperty('translate')
    item.style.removeProperty('scale')
    item.style.removeProperty('opacity')
  }

  const pose = (item: HTMLElement, progress: number, offset: { x: number, y: number }): void => {
    const next = splitPose(progress, offset)
    item.setAttribute(GOO_SPLIT_ATTR, '')
    item.style.translate = next.translate
    item.style.scale = String(next.scale)
    item.style.opacity = String(next.opacity)
    follow(item)
  }

  const reduced = (): boolean => resolveMotionPreference(host) === 'reduce'

  function setActive(active: boolean): void {
    if (disposed || active === Boolean(layer))
      return
    if (active) {
      layer = doc.createElement('span')
      layer.setAttribute(GOO_LAYER_ATTR, '')
      layer.setAttribute('aria-hidden', 'true')
      filter = createGooFilter(doc, filterId)
      layer.style.filter = `url(#${filterId})`
      host.prepend(filter, layer)
      host.setAttribute(GOO_HOST_ATTR, '')
      mirror()
      resizer?.observe(host)
      mutations?.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'style', 'class', 'data-state'] })
      for (const type of WAKE_EVENTS)
        host.addEventListener(type, wake, { passive: true })
      measure()
      wake()
      return
    }
    halt()
    resizer?.disconnect()
    mutations?.disconnect()
    for (const type of WAKE_EVENTS)
      host.removeEventListener(type, wake)
    // 分离途中的，与融回后留着姿态等宿主藏起来的，都交还给皮肤
    for (const item of [...splits.keys(), ...options.members()]) {
      if (splits.has(item) || item.hasAttribute(GOO_SPLIT_ATTR))
        clearPose(item, true)
    }
    for (const domain of options.domains?.() ?? []) {
      for (const attr of READING_ATTRS)
        domain.removeAttribute(attr)
    }
    blobs.clear()
    layer?.remove()
    filter?.remove()
    layer = null
    filter = null
    signature = ''
    host.removeAttribute(GOO_HOST_ATTR)
  }

  /** 把源块的读数（色调、通透档）同步给色块层与墨色域，亮边朝向跟源块的光源方向。 */
  function mirror(): void {
    if (!layer)
      return
    if (filter) {
      const style = win.getComputedStyle(options.source)
      const x = Number.parseFloat(style.getPropertyValue('--xh-_liquid-light-x'))
      const y = Number.parseFloat(style.getPropertyValue('--xh-_liquid-light-y'))
      lightGooFilter(filter, Number.isFinite(x) ? x : DEFAULT_LIGHT, Number.isFinite(y) ? y : DEFAULT_LIGHT)
    }
    for (const target of [layer, ...(filter ? [filter] : []), ...(options.domains?.() ?? [])]) {
      for (const attr of READING_ATTRS) {
        const value = options.source.getAttribute(attr)
        if (value === null)
          target.removeAttribute(attr)
        else if (target.getAttribute(attr) !== value)
          target.setAttribute(attr, value)
      }
    }
  }

  function split(items: readonly HTMLElement[], open: boolean): Promise<SpringValueSettle> {
    if (!layer || reduced()) {
      for (const item of items)
        clearPose(item, true)
      return Promise.resolve('rest')
    }
    const step = readMotion(host).duration('enter') / 5
    const source = centerWithin(options.source, host)
    const placed = items.map((item) => {
      const center = centerWithin(item, host)
      return { item, offset: { x: source.x - center.x, y: source.y - center.y } }
    })
    // 分离时离源块近的先走，融回时远的先回
    placed.sort((a, b) => Math.hypot(a.offset.x, a.offset.y) - Math.hypot(b.offset.x, b.offset.y))
    if (!open)
      placed.reverse()
    const target = open ? 1 : 0
    return Promise.all(placed.map(({ item, offset }, index) => {
      let split = splits.get(item)
      if (!split) {
        // 新冒出来的块从源块里起步；已在场的块（分离途中收起、融回途中又展开）从当前进度接着走
        const start = open ? 0 : 1
        const entry: Split = {
          offset,
          timer: 0,
          spring: createSpringValue({ spring: 'merge', value: start, target: item, onUpdate: value => pose(item, value, entry.offset) }),
        }
        split = entry
        splits.set(item, entry)
        pose(item, start, offset)
      }
      const current = split
      current.offset = offset
      win.clearTimeout(current.timer)
      return new Promise<SpringValueSettle>((resolve) => {
        const run = (): void => void current.spring.to(target).then(resolve)
        const delay = index * step
        if (delay > 0)
          current.timer = win.setTimeout(run, delay)
        else run()
      })
    })).then((results) => {
      const settled: SpringValueSettle = results.every(result => result === 'rest') ? 'rest' : 'interrupted'
      if (settled === 'rest') {
        for (const { item } of placed) {
          // 分离落定：姿态恰好是皮肤的静止态，撤掉行内姿态（接管标记留着）。融回落定：块已缩进源块、
          // 完全透明，留着姿态等宿主把它们藏起来，免得藏起来之前闪回原位
          if (open)
            clearPose(item, false)
          else splits.delete(item)
        }
      }
      return settled
    })
  }

  const group: GooGroup = {
    host,
    source: options.source,
    includes: el => options.members().includes(el as HTMLElement),
    setActive,
    mirror,
    wake,
    api: {
      get active() {
        return Boolean(layer)
      },
      get animated() {
        return Boolean(layer) && !reduced()
      },
      split,
      dispose() {
        if (disposed)
          return
        onDispose(group)
        disposed = true
      },
    },
  }
  return group
}
