/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-frame>：设计器外框。按命名区布局：上方一条（工具栏），中间一行左、中、右（物料、画布、属性），
// 中间一列的下方（问题列表）。区名由产品登记，作者内容用 slot="<区名>" 放进对应的区，没写 slot 的放进中间区。
// panels 列出要显示的区（空格分隔），不写即全部显示，写空串则只留中间区。区间用 <xh-splitter>，宽度可拖；
// 同一位置上下堆叠的几个区之间也有分隔条，缺省等分。

import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { XhSplitterElement } from '@xihan-ui/web-components/define'
import type { DesignerFrameTranslations } from '../translations'
import { createAuthoredElement, createGeneratedElement, emitEvent, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { adoptSlots } from '../internal/slots'
import { defineFrameElements } from '../internal/ui-elements'

/** 外框搭的一条分隔条：分隔条按顺序调整的区名。 */
interface FrameSplitter {
  readonly element: XhSplitterElement
  readonly triggers: readonly string[]
}

/** 区的位置：上方一条、中间一行的左、中、右，以及中间一列的下方。 */
export type DesignerFramePosition = 'top' | 'start' | 'center' | 'end' | 'bottom'

/** 可以拖动调整大小的位置。 */
export type DesignerFrameResizable = 'start' | 'end' | 'bottom'

/** 一个命名区。同一位置的多个区按登记顺序上下排列，共用一个可调整的大小，区与区之间可拖动分高度。 */
export interface DesignerFrameRegion {
  /** 区名：写 slot="<区名>" 的子元素放进这个区，panels 也按它开关。 */
  readonly name: string
  /** 区在外框里的位置。 */
  readonly position: DesignerFramePosition
  /** 所在位置的缺省大小（百分比）：start、end 占中间一行的宽度，bottom 占中间一列的高度；取该位置第一个区的值。 */
  readonly size?: number
  /** 拖动时所在位置的下限（百分比），缺省 10；取该位置第一个区的值。 */
  readonly minSize?: number
  /** 分隔条无障碍名称里的区名，缺省用 name。 */
  readonly label?: string
}

/** 外框各处的大小（百分比）。 */
export interface DesignerFrameSizes {
  /** start 位置占中间一行的宽度。 */
  readonly start?: number
  /** end 位置占中间一行的宽度。 */
  readonly end?: number
  /** bottom 位置占中间一列的高度。 */
  readonly bottom?: number
  /** 同一位置上下堆叠的区各自占该位置高度的百分比，键为区名；只有一个区的位置不出现。 */
  readonly regions?: Readonly<Record<string, number>>
}

/** 外框派发的事件。 */
export interface DesignerFrameEventMap {
  /** 拖动或用键盘调整了某个位置或堆叠区的大小；拖动途中连续发出。 */
  'sizes-change': CustomEvent<{ sizes: DesignerFrameSizes }>
}

/** 缺省的命名区：工具栏、物料、画布、属性、问题。 */
export const DESIGNER_FRAME_REGIONS: readonly DesignerFrameRegion[] = [
  { name: 'toolbar', position: 'top' },
  { name: 'palette', position: 'start', size: 18 },
  { name: 'canvas', position: 'center' },
  { name: 'properties', position: 'end', size: 24 },
  { name: 'issues', position: 'bottom', size: 28 },
]

/**
 * 解析 panels：空格分隔的区名，多个空白与制表符都当分隔。没写（null 或 undefined）为 undefined，表示全部显示；
 * 空串为空集合，表示全部收起。
 */
export function parseDesignerPanels(value: string | null | undefined): ReadonlySet<string> | undefined {
  if (value === null || value === undefined)
    return undefined
  return new Set(value.split(/\s+/).filter(Boolean))
}

const DEFAULT_TRANSLATIONS: DesignerFrameTranslations = {
  layout: 'Designer layout',
  resize: label => `Resize ${label}`,
}

const TAG = 'xh-designer-frame'
/** 外框生成的结构都带这个 data-scope，样式只认它，不碰区里的作者内容。 */
const SCOPE = 'designer-frame'
const DEFAULT_MIN_SIZE = 10
const CENTER_MIN_SIZE = 20
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }

interface Parts {
  readonly top: HTMLElement
  readonly body: HTMLElement
}

function isPositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

/** 堆叠区的下限：缺省 10%，区多到放不下时取等分。 */
function stackMinSize(count: number): number {
  return Math.min(DEFAULT_MIN_SIZE, 100 / count)
}

/** 按比例归一到合计 100；归一后低于下限的区定在下限，其余区按比例分剩下的。 */
function normalizeShares(raw: readonly number[], min: number): number[] {
  const fixed = new Set<number>()
  for (;;) {
    const room = 100 - fixed.size * min
    const free = raw.reduce((sum, value, index) => (fixed.has(index) ? sum : sum + value), 0)
    const shares = raw.map((value, index) => (fixed.has(index) ? min : free > 0 ? value / free * room : room / (raw.length - fixed.size)))
    const low = shares.findIndex((share, index) => !fixed.has(index) && share < min)
    if (low < 0)
      return shares
    fixed.add(low)
  }
}

/** 一轮布局：各位置当前显示的区。 */
type Layout = Readonly<Record<DesignerFramePosition, readonly DesignerFrameRegion[]>>

export class XhDesignerFrameElement extends XhReactiveElement {
  static override properties = {
    regions: { attribute: false },
    panels: { converter: STRING_CONVERTER },
    sizes: { attribute: false },
    translations: { attribute: false },
  }

  /** 命名区，缺省为 DESIGNER_FRAME_REGIONS。 */
  declare regions: readonly DesignerFrameRegion[] | undefined
  /** 要显示的区，空格分隔；不写即全部显示，写空串则只留中间区。中间区总是显示。同名 attribute。 */
  declare panels: string | undefined
  /** 各处的大小（百分比），用来恢复上次的布局；不给的位置用区的缺省大小，不给的堆叠区等分。 */
  declare sizes: DesignerFrameSizes | undefined
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerFrameTranslations> | undefined

  /** 注册外框用到的库内元素。 */
  static defineDependencies(): void {
    defineFrameElements()
  }

  readonly #config = new XhConfigController(this)
  #parts: Parts | undefined
  readonly #regions = new Map<string, HTMLElement>()
  #releaseSlots: (() => void) | undefined
  #slotsKey = ''
  #layoutKey = ''
  #splitters: FrameSplitter[] = []
  #current: Partial<Record<DesignerFrameResizable, number>> = {}
  #shares: Record<string, number> = {}
  #dirObserver: MutationObserver | undefined

  override connectedCallback(): void {
    super.connectedCallback()
    this.#ensureParts()
    this.#syncRegions()
    if (typeof MutationObserver === 'function') {
      this.#dirObserver ??= new MutationObserver(() => this.requestUpdate())
      this.#dirObserver.observe(this, { attributes: true, attributeFilter: ['dir'] })
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#dirObserver?.disconnect()
    this.#releaseSlots?.()
    this.#releaseSlots = undefined
    this.#slotsKey = ''
  }

  /** 这个区是否显示：中间区总是显示，其余按 panels。 */
  showsPanel(name: string): boolean {
    const region = this.#regionList().find(item => item.name === name)
    if (region?.position === 'center')
      return true
    const shown = parseDesignerPanels(this.panels)
    return region !== undefined && (shown === undefined || shown.has(name))
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    this.#syncRegions()
    if (changed.has('sizes') && this.sizes !== undefined) {
      const { regions, ...positions } = this.sizes
      this.#current = { ...this.#current, ...Object.fromEntries(Object.entries(positions).filter(([, value]) => isPositive(value))) }
      this.#shares = { ...this.#shares, ...Object.fromEntries(Object.entries(regions ?? {}).filter(([, value]) => isPositive(value))) }
    }
    const t = this.#config.translations<DesignerFrameTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    const layout = this.#layout()
    const key = JSON.stringify([this.#direction(), Object.entries(layout).map(([position, regions]) => [position, regions.map(region => region.name)])])
    if (key !== this.#layoutKey || changed.has('sizes')) {
      this.#layoutKey = key
      this.#build(parts, layout)
    }
    const labelOf = (name: string): string => {
      const region = this.#regionList().find(item => item.name === name)
      return region?.label ?? name
    }
    for (const { element, triggers } of this.#splitters)
      element.translations = { root: t.layout, resizeTrigger: index => t.resize(labelOf(triggers[index] ?? '')) }
  }

  /** 外框所在的文字方向，交给分隔条换算左右键与指针位移的正负。 */
  #direction(): 'ltr' | 'rtl' {
    return this.ownerDocument.defaultView?.getComputedStyle(this).direction === 'rtl' ? 'rtl' : 'ltr'
  }

  #regionList(): readonly DesignerFrameRegion[] {
    return this.regions ?? DESIGNER_FRAME_REGIONS
  }

  #ensureParts(): Parts {
    if (this.#parts?.top.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const top = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'top' })
    const body = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'body' })
    this.append(top, body)
    this.#parts = { top, body }
    return this.#parts
  }

  /** 按登记的区建好区容器，并把作者带 slot 的子节点搬进去。 */
  #syncRegions(): void {
    const doc = this.ownerDocument
    const names = new Set<string>()
    for (const region of this.#regionList()) {
      names.add(region.name)
      if (!this.#regions.has(region.name))
        this.#regions.set(region.name, createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'region', 'data-region': region.name }))
    }
    for (const name of [...this.#regions.keys()]) {
      if (!names.has(name)) {
        this.#regions.get(name)!.remove()
        this.#regions.delete(name)
      }
    }
    const center = this.#regionList().find(region => region.position === 'center')
    const key = JSON.stringify([[...names], center?.name])
    if (!this.isConnected || key === this.#slotsKey)
      return
    this.#slotsKey = key
    this.#releaseSlots?.()
    this.#releaseSlots = adoptSlots(this, Object.fromEntries(this.#regions), center === undefined ? undefined : this.#regions.get(center.name))
  }

  #layout(): Layout {
    const layout: Record<DesignerFramePosition, DesignerFrameRegion[]> = { top: [], start: [], center: [], end: [], bottom: [] }
    for (const region of this.#regionList()) {
      if (this.showsPanel(region.name))
        layout[region.position].push(region)
    }
    return layout
  }

  /** 位置的大小，夹在它的下限与 room 之间；room 是中间区留够下限后还剩的百分比。 */
  #sizeOf(position: DesignerFrameResizable, regions: readonly DesignerFrameRegion[], room: number): number {
    const min = regions[0]?.minSize ?? DEFAULT_MIN_SIZE
    return Math.min(Math.max(this.#current[position] ?? regions[0]?.size ?? 20, min), Math.max(min, room))
  }

  /** 堆叠区各自的高度（百分比）：记下的值缺的按平均补上，再按比例归一到合计 100，不低于下限。 */
  #stackSizes(regions: readonly DesignerFrameRegion[]): number[] {
    const even = 100 / regions.length
    return normalizeShares(regions.map(region => this.#shares[region.name] ?? even), stackMinSize(regions.length))
  }

  /** 一个位置的区：一个区时直接放进去，多个区时上下排列并以分隔条隔开。 */
  #stack(regions: readonly DesignerFrameRegion[], position: DesignerFramePosition): HTMLElement {
    const stack = createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'stack', 'data-position': position })
    const nodes = regions.map(region => this.#regions.get(region.name)!)
    if (regions.length < 2) {
      stack.append(...nodes)
      return stack
    }
    const sizes = this.#stackSizes(regions)
    const min = stackMinSize(regions.length)
    stack.append(this.#splitter('vertical', regions.map((region, index) => ({ node: nodes[index]!, id: region.name, size: sizes[index]!, min })), regions.slice(0, -1).map(region => region.name), (next) => {
      regions.forEach((region, index) => {
        this.#shares[region.name] = next[index]!
      })
    }))
    return stack
  }

  /** 两块以上面板的 <xh-splitter>：sizes 与 panels 按面板顺序，triggers 为每条分隔条名称里的区名，record 记下拖动后的大小。 */
  #splitter(orientation: 'horizontal' | 'vertical', panels: readonly { readonly node: HTMLElement, readonly id: string, readonly size: number, readonly min: number }[], triggers: readonly string[], record: (sizes: readonly number[]) => void): HTMLElement {
    const doc = this.ownerDocument
    const children: HTMLElement[] = []
    panels.forEach((panel, index) => {
      if (index > 0)
        children.push(createAuthoredElement(doc, 'div', { 'data-xh-part': 'resize-trigger', 'index': index - 1 }))
      children.push(createAuthoredElement(doc, 'div', { 'data-xh-part': 'panel', 'index': index }, [panel.node]))
    })
    const splitter = createAuthoredElement(doc, 'xh-splitter', {
      'orientation': orientation,
      'dir': this.#direction(),
      'default-sizes': panels.map(panel => Math.round(panel.size * 1000) / 1000).join(','),
      'panels': JSON.stringify(panels.map(panel => ({ id: panel.id, min: panel.min }))),
      'data-scope': SCOPE,
      'data-part': 'splitter',
      'data-orientation': orientation,
    }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, children)]) as XhSplitterElement
    this.#splitters.push({ element: splitter, triggers })
    splitter.addEventListener('sizes-change-end', event => event.stopPropagation())
    splitter.addEventListener('sizes-change', (event) => {
      event.stopPropagation()
      if (event.target !== splitter)
        return
      const { sizes } = (event as CustomEvent<{ sizes: number[] }>).detail
      record(sizes)
      emitEvent(this, 'sizes-change', { sizes: this.#snapshot() })
    })
    return splitter
  }

  /** 交给 sizes-change 的大小：位置的大小，加上记下过的、现在仍登记着的堆叠区高度。 */
  #snapshot(): DesignerFrameSizes {
    const names = new Set(this.#regionList().map(region => region.name))
    const regions = Object.fromEntries(Object.entries(this.#shares).filter(([name]) => names.has(name)))
    return Object.keys(regions).length === 0 ? { ...this.#current } : { ...this.#current, regions }
  }

  #build(parts: Parts, layout: Layout): void {
    this.#splitters = []
    for (const [position, regions] of Object.entries(layout)) {
      for (const region of regions)
        this.#regions.get(region.name)!.setAttribute('data-position', position)
    }
    parts.top.replaceChildren(...layout.top.map(region => this.#regions.get(region.name)!))
    parts.top.hidden = layout.top.length === 0

    let main: HTMLElement = this.#stack(layout.center, 'center')
    if (layout.bottom.length > 0) {
      const bottom = this.#sizeOf('bottom', layout.bottom, 100 - CENTER_MIN_SIZE)
      main = this.#splitter('vertical', [
        { node: main, id: 'center', size: 100 - bottom, min: CENTER_MIN_SIZE },
        { node: this.#stack(layout.bottom, 'bottom'), id: 'bottom', size: bottom, min: layout.bottom[0]!.minSize ?? DEFAULT_MIN_SIZE },
      ], [layout.bottom[0]!.name], (next) => {
        this.#current.bottom = next[1]!
      })
    }

    const row: { node: HTMLElement, id: string, size: number, min: number }[] = []
    const triggers: string[] = []
    const start = layout.start.length > 0 ? this.#sizeOf('start', layout.start, 100 - CENTER_MIN_SIZE - (layout.end.length > 0 ? layout.end[0]!.minSize ?? DEFAULT_MIN_SIZE : 0)) : 0
    const end = layout.end.length > 0 ? this.#sizeOf('end', layout.end, 100 - CENTER_MIN_SIZE - start) : 0
    if (layout.start.length > 0) {
      row.push({ node: this.#stack(layout.start, 'start'), id: 'start', size: start, min: layout.start[0]!.minSize ?? DEFAULT_MIN_SIZE })
      triggers.push(layout.start[0]!.name)
    }
    row.push({ node: createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'main' }, [main]), id: 'center', size: 100 - start - end, min: CENTER_MIN_SIZE })
    if (layout.end.length > 0) {
      row.push({ node: this.#stack(layout.end, 'end'), id: 'end', size: end, min: layout.end[0]!.minSize ?? DEFAULT_MIN_SIZE })
      triggers.push(layout.end[0]!.name)
    }
    parts.body.replaceChildren(row.length > 1
      ? this.#splitter('horizontal', row, triggers, (next) => {
          row.forEach((panel, index) => {
            if (panel.id === 'start' || panel.id === 'end')
              this.#current[panel.id] = next[index]!
          })
        })
      : row[0]!.node)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-frame': XhDesignerFrameElement
  }
}
