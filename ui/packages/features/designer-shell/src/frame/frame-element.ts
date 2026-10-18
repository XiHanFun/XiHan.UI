/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-frame>：设计器外框。按命名区布局：最上一条顶栏、下面一条（工具栏），中间一行左、中、右（物料、画布、属性），
// 中间一列的下方（问题列表），最下一条状态栏。区名由产品登记，作者内容用 slot="<区名>" 放进对应的区，没写 slot 的放进中间区。
// panels 列出要显示的区（空格分隔），不写即全部显示，写空串则只留中间区。区间用 <xh-splitter>，宽度可拖；
// 同一位置上下堆叠的几个区之间也有分隔条，缺省等分。
// 左右与下方的区给了标题就画成一张卡片：面板头写标题与副标题，右侧是操作区、帮助与关闭。
// 顶栏分左、中、右三段，状态栏分左、右两段，各段有内容才显示；画布区四角与右侧另有浮动条的落点。
// 视口窄于 --xh-breakpoint-md 时进窄屏：中间一列占满整行，左右两侧的区收进从两边滑出的抽屉，缺省收着，由「面板」开关。

import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { XhDrawerElement, XhSplitterElement } from '@xihan-ui/web-components/define'
import type { DesignerFrameTranslations } from '../translations'
import { createAuthoredElement, createGeneratedElement, emitEvent, setAttributes, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { adoptSlots } from '../internal/slots'
import { defineFrameElements } from '../internal/ui-elements'

/** 外框搭的一条分隔条：分隔条按顺序调整的区名。 */
interface FrameSplitter {
  readonly element: XhSplitterElement
  readonly triggers: readonly string[]
}

/** 分隔条里的一块面板：collapsed 的建出来就收着。 */
interface FramePanel {
  readonly node: HTMLElement
  readonly id: string
  readonly size: number
  readonly min: number
  readonly collapsible?: boolean
  readonly collapsed?: boolean
}

/** 外框里的一条分隔条：所在分栏的方向与它的序号。 */
interface FrameTriggerRef {
  readonly orientation: 'horizontal' | 'vertical'
  readonly index: number
}

/** 窄屏时收进抽屉的两侧位置。 */
type DrawerPosition = 'start' | 'end'

/** 窄屏时一侧的抽屉：抽屉元素与放区的正文。 */
interface FrameDrawer {
  readonly element: XhDrawerElement
  readonly content: HTMLElement
  readonly body: HTMLElement
}

/** 进窄屏的断点令牌：视口窄于它就进窄屏。 */
const NARROW_BREAKPOINT = '--xh-breakpoint-md'

/** 区的位置：最上的顶栏、下面一条、中间一行的左、中、右、中间一列的下方，以及最下的状态栏。 */
export type DesignerFramePosition = 'header' | 'top' | 'start' | 'center' | 'end' | 'bottom' | 'status'

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
  /** 拖动时所在位置的下限（百分比），缺省 10；取该位置第一个区的值。外框按尺寸槽算出的下限更大时以那个为准。 */
  readonly minSize?: number
  /** 分隔条无障碍名称里的区名，缺省用 title，再缺省用 name。 */
  readonly label?: string
  /** 面板头的标题：给了就把这个区画成一张卡片，头部写标题；只对 start、end、bottom 三个位置生效。 */
  readonly title?: string
  /** 面板头标题下的一行副标题，如属性面板当前对象的名字。 */
  readonly subtitle?: string
  /** 面板头的帮助：给了就在右上角出帮助钮，悬停或聚焦时弹出这段说明。 */
  readonly help?: string
  /** 面板头出关闭钮，点了收起这块面板（从 panels 里去掉它）；缺省 true。 */
  readonly closable?: boolean
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
  /** 点了面板头的关闭钮：外框已经收起这块面板，panels 是收起之后要显示的区（空格分隔），设计器据此同步自己的 panels。 */
  'panels-change': CustomEvent<{ panels: string }>
}

/** 缺省的命名区：顶栏、工具栏、物料、画布、属性、问题、状态栏。 */
export const DESIGNER_FRAME_REGIONS: readonly DesignerFrameRegion[] = [
  { name: 'header', position: 'header' },
  { name: 'toolbar', position: 'top' },
  { name: 'palette', position: 'start', size: 18 },
  { name: 'canvas', position: 'center' },
  { name: 'properties', position: 'end', size: 24 },
  { name: 'issues', position: 'bottom', size: 28 },
  { name: 'status', position: 'status' },
]

/** 顶栏与状态栏的分段：作者内容写 slot="<区名>-<段名>"，只写 slot="<区名>" 的放进第一个缺省段。 */
const ZONES: Readonly<Partial<Record<DesignerFramePosition, readonly string[]>>> = {
  header: ['start', 'center', 'end'],
  status: ['start', 'end'],
}

/** 只写区名的作者内容放进哪一段。 */
const DEFAULT_ZONE: Readonly<Partial<Record<DesignerFramePosition, string>>> = { header: 'center', status: 'start' }

/** 画布区上浮动条的落点：作者内容写 slot="<中间区名>-<落点>"。 */
const OVERLAYS = ['top-start', 'top-end', 'bottom-start', 'bottom-end', 'end'] as const

/** 会画成卡片的位置。 */
const CARD_POSITIONS: ReadonlySet<DesignerFramePosition> = new Set(['start', 'end', 'bottom'])

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
  closePanel: label => `Close ${label}`,
  panelHelp: label => `About ${label}`,
}

const TAG = 'xh-designer-frame'
/** 外框生成的结构都带这个 data-scope，样式只认它，不碰区里的作者内容。 */
const SCOPE = 'designer-frame'
const DEFAULT_MIN_SIZE = 10
const CENTER_MIN_SIZE = 20
/** 尺寸槽算出的下限变化不到这么多（百分比）时不重排。 */
const MIN_SIZE_EPSILON = 0.5

/** 分隔条报来的大小不超过它就算在分隔条上收起了（百分比）。 */
const COLLAPSED_SIZE = 0.01
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }

interface Parts {
  readonly header: HTMLElement
  readonly top: HTMLElement
  readonly body: HTMLElement
  readonly status: HTMLElement
  /** 量尺寸槽用的三个隐形块：左右与下方的下限。 */
  readonly probes: Readonly<Record<DesignerFrameResizable, HTMLElement>>
}

/** 一个区的容器与它生成的部件。 */
interface RegionParts {
  readonly element: HTMLElement
  /** 作者内容放进哪里：卡片放在 panel-body，其余放在区本身。 */
  readonly content: HTMLElement
  /** 顶栏、状态栏的分段，画布区的浮动条落点。 */
  readonly zones: Readonly<Record<string, HTMLElement>>
  readonly card?: CardParts
  /** 区结构的签名：位置与是不是卡片变了就重建。 */
  readonly signature: string
}

/** 卡片的面板头。 */
interface CardParts {
  readonly title: HTMLElement
  readonly subtitle: HTMLElement
  readonly actions: HTMLElement
  readonly help: HTMLElement & { disabled?: boolean }
  readonly helpTrigger: HTMLElement
  readonly helpContent: HTMLElement
  readonly close: HTMLButtonElement
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
  /** 要显示的区，空格分隔；不写即全部显示，写空串则只留中间区。中间区总是显示，顶栏有内容就显示。同名 attribute。 */
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
  readonly #regions = new Map<string, RegionParts>()
  #releaseSlots: (() => void) | undefined
  #slotsKey = ''
  #layoutKey = ''
  #splitters: FrameSplitter[] = []
  #current: Partial<Record<DesignerFrameResizable, number>> = {}
  /** 在分隔条上收起的位置；收起期间 #current 里仍是收起前的大小。 */
  readonly #collapsed = new Set<DesignerFrameResizable>()
  /** 重排后要把焦点放回的分隔条。 */
  #refocus: FrameTriggerRef | undefined
  #shares: Record<string, number> = {}
  /** 尺寸槽折成的下限（百分比），量不出来时没有。 */
  #measuredMin: Partial<Record<DesignerFrameResizable, number>> = {}
  #dirObserver: MutationObserver | undefined
  #zoneObserver: MutationObserver | undefined
  #resizeObserver: ResizeObserver | undefined
  #ids = 0
  /** 视口窄于断点：左右两侧收进抽屉。 */
  #narrow = false
  #narrowQuery: MediaQueryList | undefined
  /** 窄屏时开着的那一侧抽屉；同时只开一侧。 */
  #drawer: DrawerPosition | undefined
  readonly #drawers: Partial<Record<DrawerPosition, FrameDrawer>> = {}
  readonly #onNarrowChange = (): void => {
    const narrow = this.#narrowQuery !== undefined && !this.#narrowQuery.matches
    if (narrow === this.#narrow)
      return
    this.#narrow = narrow
    this.#drawer = undefined
    this.requestUpdate()
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.#ensureParts()
    this.#syncRegions()
    if (typeof MutationObserver === 'function') {
      this.#dirObserver ??= new MutationObserver(() => this.requestUpdate())
      this.#dirObserver.observe(this, { attributes: true, attributeFilter: ['dir'] })
    }
    if (typeof ResizeObserver === 'function') {
      this.#resizeObserver ??= new ResizeObserver(() => this.#measure())
      this.#resizeObserver.observe(this)
    }
    this.#watchNarrow()
  }

  /** 按断点令牌盯视口宽度；没有 matchMedia 或令牌缺席时不进窄屏。 */
  #watchNarrow(): void {
    const win = this.ownerDocument.defaultView
    const width = win?.getComputedStyle(this.ownerDocument.documentElement).getPropertyValue(NARROW_BREAKPOINT).trim()
    this.#narrowQuery?.removeEventListener('change', this.#onNarrowChange)
    this.#narrowQuery = width && typeof win?.matchMedia === 'function' ? win.matchMedia(`(min-width: ${width})`) : undefined
    this.#narrowQuery?.addEventListener('change', this.#onNarrowChange)
    this.#onNarrowChange()
  }

  /** 视口窄于断点（--xh-breakpoint-md）时为真：中间一列占满整行，左右两侧的区收进抽屉。 */
  get narrow(): boolean {
    return this.#narrow
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#dirObserver?.disconnect()
    this.#zoneObserver?.disconnect()
    this.#zoneObserver = undefined
    this.#resizeObserver?.disconnect()
    this.#releaseSlots?.()
    this.#releaseSlots = undefined
    this.#slotsKey = ''
    this.#narrowQuery?.removeEventListener('change', this.#onNarrowChange)
    this.#narrowQuery = undefined
  }

  /** 这个区是否显示：中间区总是显示；顶栏有内容就显示；状态栏按 panels 且有内容才显示；其余按 panels。 */
  showsPanel(name: string): boolean {
    const region = this.#regionList().find(item => item.name === name)
    if (region === undefined)
      return false
    if (region.position === 'center')
      return true
    if (region.position === 'header')
      return this.#hasContent(name)
    const shown = parseDesignerPanels(this.panels)
    const listed = shown === undefined || shown.has(name)
    return region.position === 'status' ? listed && this.#hasContent(name) : listed
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
    const mins = (['start', 'end', 'bottom'] as const).map(position => Math.round((this.#measuredMin[position] ?? 0) / MIN_SIZE_EPSILON))
    const key = JSON.stringify([this.#direction(), mins, this.#narrow, Object.entries(layout).map(([position, regions]) => [position, regions.map(region => region.name)])])
    if (key !== this.#layoutKey || changed.has('sizes')) {
      this.#layoutKey = key
      this.#build(parts, layout)
      this.#restoreFocus()
    }
    for (const region of this.#regionList()) {
      const card = this.#regions.get(region.name)?.card
      if (card)
        this.#paintCard(region, card, t)
    }
    const labelOf = (name: string): string => {
      const region = this.#regionList().find(item => item.name === name)
      return region?.label ?? region?.title ?? name
    }
    for (const { element, triggers } of this.#splitters)
      element.translations = { root: t.layout, resizeTrigger: index => t.resize(labelOf(triggers[index] ?? '')) }
    this.toggleAttribute('data-narrow', this.#narrow)
    for (const position of ['start', 'end'] as const) {
      const drawer = this.#drawers[position]
      if (!drawer)
        continue
      const open = this.#narrow && this.#drawer === position && layout[position].length > 0
      if (drawer.element.open !== open)
        drawer.element.open = open
      drawer.element.side = this.#sideOf(position)
      drawer.content.setAttribute('aria-label', layout[position].map(region => region.title ?? region.label ?? region.name).join('、'))
    }
  }

  /** 抽屉从哪条边滑出：行首一侧从左往右写时在左边。 */
  #sideOf(position: DrawerPosition): 'left' | 'right' {
    const rtl = this.#direction() === 'rtl'
    return (position === 'start') !== rtl ? 'left' : 'right'
  }

  /** 一侧的抽屉：局部、非模态，Esc 收起；第一次用到时建。 */
  #ensureDrawer(position: DrawerPosition): FrameDrawer {
    const existing = this.#drawers[position]
    if (existing)
      return existing
    const doc = this.ownerDocument
    const body = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'drawer-body' })
    const content = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [body])
    const element = createAuthoredElement(doc, 'xh-drawer', {
      'contained': '',
      'modal': 'false',
      'close-on-interact-outside': 'false',
      'size': 'md',
      'side': this.#sideOf(position),
    }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [content]),
      ]),
    ]) as XhDrawerElement
    // 只认抽屉自己的开合；区里的提示、下拉等冒泡上来的 open-change 照常往外传
    element.addEventListener('open-change', (event) => {
      if (event.target !== element)
        return
      event.stopPropagation()
      if (!(event as CustomEvent<{ open: boolean }>).detail.open && this.#drawer === position) {
        this.#drawer = undefined
        this.requestUpdate()
      }
    })
    const drawer = { element, content, body }
    this.#drawers[position] = drawer
    return drawer
  }

  /** 外框所在的文字方向，交给分隔条换算左右键与指针位移的正负。 */
  #direction(): 'ltr' | 'rtl' {
    return this.ownerDocument.defaultView?.getComputedStyle(this).direction === 'rtl' ? 'rtl' : 'ltr'
  }

  #regionList(): readonly DesignerFrameRegion[] {
    return this.regions ?? DESIGNER_FRAME_REGIONS
  }

  /** 顶栏、状态栏的某一段有没有元素。 */
  #hasContent(name: string): boolean {
    const zones = this.#regions.get(name)?.zones ?? {}
    return Object.values(zones).some(zone => zone.childElementCount > 0)
  }

  #ensureParts(): Parts {
    if (this.#parts?.top.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const header = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'header' })
    const top = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'top' })
    const body = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'body' })
    const status = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'status' })
    const probe = (position: DesignerFrameResizable): HTMLElement => createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'probe', 'data-position': position, 'aria-hidden': 'true' })
    const probes = { start: probe('start'), end: probe('end'), bottom: probe('bottom') }
    const probeBox = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'probes', 'aria-hidden': 'true' }, Object.values(probes))
    this.append(header, top, body, status, probeBox)
    this.#parts = { header, top, body, status, probes }
    return this.#parts
  }

  /** 把尺寸槽给的下限（像素）折成占外框的百分比；变化够大时重排。 */
  #measure(): void {
    const parts = this.#parts
    if (!parts)
      return
    const width = parts.body.clientWidth
    const height = parts.body.clientHeight
    const next: Partial<Record<DesignerFrameResizable, number>> = {}
    for (const position of ['start', 'end', 'bottom'] as const) {
      const extent = position === 'bottom' ? height : width
      const size = position === 'bottom' ? parts.probes[position].offsetHeight : parts.probes[position].offsetWidth
      if (extent > 0 && size > 0)
        next[position] = Math.min(size / extent * 100, 100 - CENTER_MIN_SIZE)
    }
    const changed = (['start', 'end', 'bottom'] as const).some(position => Math.abs((next[position] ?? 0) - (this.#measuredMin[position] ?? 0)) >= MIN_SIZE_EPSILON)
    if (!changed)
      return
    this.#measuredMin = next
    this.requestUpdate()
  }

  #nextId(part: string): string {
    this.#ids += 1
    return `xh-designer-frame-${part}-${this.#ids}`
  }

  /** 一个区的结构：卡片带面板头，顶栏与状态栏分段，画布区带浮动条的落点。 */
  #createRegion(region: DesignerFrameRegion): RegionParts {
    const doc = this.ownerDocument
    const card = CARD_POSITIONS.has(region.position) && region.title !== undefined
    const center = region.position === 'center'
    const signature = `${region.position}:${card}`
    const element = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'region', 'data-region': region.name })
    const zoneNames = ZONES[region.position] ?? []
    const zones: Record<string, HTMLElement> = {}
    for (const zone of zoneNames)
      zones[zone] = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'zone', 'data-zone': zone })
    if (center) {
      for (const overlay of OVERLAYS)
        zones[overlay] = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'overlay', 'data-overlay': overlay })
    }
    if (!card) {
      element.append(...Object.values(zones))
      return { element, content: element, zones, signature }
    }
    const titleId = this.#nextId('title')
    const title = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-title', 'id': titleId })
    const subtitle = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-subtitle' })
    const actions = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-actions' })
    const helpTrigger = createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button' })
    const helpContent = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' })
    const help = createAuthoredElement(doc, 'xh-tooltip', { 'placement': 'bottom-end', 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'panel-help-tip' }, [
      helpTrigger,
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [helpContent]),
    ])
    const close = createAuthoredElement(doc, 'button', { 'type': 'button', 'data-scope': SCOPE, 'data-part': 'panel-close' }) as HTMLButtonElement
    close.addEventListener('click', () => this.#closePanel(region.name))
    const header = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-header' }, [
      createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-heading' }, [title, subtitle]),
      actions,
      help,
      close,
    ])
    const body = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-body' })
    setAttributes(element, { 'data-card': '', 'role': 'region', 'aria-labelledby': titleId })
    element.append(header, body)
    return { element, content: body, zones: { actions }, signature, card: { title, subtitle, actions, help, helpTrigger, helpContent, close } }
  }

  /**
   * 按登记的区建好区容器，并把作者带 slot 的子节点搬进去；区的结构变了时连同已搬进的内容一起换到新容器。
   * 新结构里没有的段（卡片换成普通区时的操作区）里的作者内容放回宿主，等结构里再有这一段时由插槽重新领走。
   */
  #syncRegions(): void {
    const names = new Set<string>()
    const orphans: Element[] = []
    for (const region of this.#regionList()) {
      names.add(region.name)
      const existing = this.#regions.get(region.name)
      const signature = `${region.position}:${CARD_POSITIONS.has(region.position) && region.title !== undefined}`
      if (existing?.signature === signature)
        continue
      const next = this.#createRegion(region)
      if (existing) {
        const generated = new Set<Element>([...Object.values(existing.zones), ...(existing.card ? [existing.content.previousElementSibling!] : [])])
        next.content.append(...Array.from(existing.content.children).filter(child => !generated.has(child)))
        for (const [zone, node] of Object.entries(existing.zones)) {
          const target = next.zones[zone]
          if (target)
            target.append(...Array.from(node.children))
          else
            orphans.push(...Array.from(node.children))
        }
        existing.element.replaceWith(next.element)
      }
      this.#regions.set(region.name, next)
    }
    for (const name of [...this.#regions.keys()]) {
      if (!names.has(name)) {
        this.#regions.get(name)!.element.remove()
        this.#regions.delete(name)
      }
    }
    if (orphans.length > 0) {
      // 先停掉按旧区领内容的观察，放回宿主的节点才不会又被领进已经换下的旧段
      this.#releaseSlots?.()
      this.#releaseSlots = undefined
      this.#slotsKey = ''
      this.append(...orphans)
    }
    const center = this.#regionList().find(region => region.position === 'center')
    const signatures = [...this.#regions.entries()].map(([name, parts]) => `${name}=${parts.signature}`)
    const key = JSON.stringify([signatures, center?.name])
    if (!this.isConnected || key === this.#slotsKey)
      return
    this.#slotsKey = key
    this.#releaseSlots?.()
    const targets: Record<string, HTMLElement> = {}
    for (const region of this.#regionList()) {
      const parts = this.#regions.get(region.name)!
      const fallbackZone = DEFAULT_ZONE[region.position]
      targets[region.name] = fallbackZone === undefined ? parts.content : parts.zones[fallbackZone]!
      for (const [zone, node] of Object.entries(parts.zones))
        targets[`${region.name}-${zone}`] = node
    }
    this.#releaseSlots = adoptSlots(this, targets, center === undefined ? undefined : this.#regions.get(center.name)!.content)
    this.#observeZones()
  }

  /** 各段与面板头操作区的内容变了就重排：顶栏、状态栏有没有内容决定显不显示，操作区空着时收起。 */
  #observeZones(): void {
    if (typeof MutationObserver !== 'function')
      return
    this.#zoneObserver?.disconnect()
    this.#zoneObserver = new MutationObserver(() => this.requestUpdate())
    for (const parts of this.#regions.values()) {
      for (const zone of Object.values(parts.zones))
        this.#zoneObserver.observe(zone, { childList: true })
    }
  }

  /** 面板头随区的描述与文案刷新。 */
  #paintCard(region: DesignerFrameRegion, card: CardParts, t: DesignerFrameTranslations): void {
    const title = region.title ?? region.name
    setText(card.title, title)
    setText(card.subtitle, region.subtitle ?? '')
    card.subtitle.hidden = !region.subtitle
    card.actions.hidden = card.actions.childElementCount === 0
    setText(card.helpContent, region.help ?? '')
    card.help.hidden = !region.help
    setAttributes(card.helpTrigger, { 'aria-label': t.panelHelp(title) })
    card.close.hidden = region.closable === false
    setAttributes(card.close, { 'aria-label': t.closePanel(title) })
  }

  /**
   * 「面板」菜单里能开关的面板：start、end、bottom 三个位置上没写 closable: false 的区，按登记顺序；
   * label 依次取 title、label、name，shown 是它此刻是否列在 panels 里。
   */
  panelEntries(): readonly { readonly name: string, readonly label: string, readonly shown: boolean }[] {
    const shown = parseDesignerPanels(this.panels)
    return this.#regionList()
      .filter(region => CARD_POSITIONS.has(region.position) && region.closable !== false)
      .map((region) => {
        const listed = shown === undefined || shown.has(region.name)
        const drawer = this.#drawerOf(region)
        const visible = drawer === undefined ? listed && this.#collapsedOf(region) === undefined : listed && this.#drawer === drawer
        return { name: region.name, label: region.title ?? region.label ?? region.name, shown: visible }
      })
  }

  /**
   * 开关一块面板：列在 panels 里就去掉、否则加上，与面板头的关闭钮一样派发 panels-change。
   * 窄屏时左右两侧的区是开关它所在那一侧的抽屉（同时只开一侧）；没列在 panels 里的先列上。
   * 所在位置在分隔条上收起着时是把那个位置放回收起前的大小，没列在 panels 里的同样先列上。
   */
  togglePanel(name: string): void {
    const region = this.#regionList().find(item => item.name === name)
    const collapsed = region && this.#collapsedOf(region)
    if (collapsed !== undefined) {
      const shown = parseDesignerPanels(this.panels)
      if (shown !== undefined && !shown.has(name))
        this.#setPanel(name, true)
      this.#expand(collapsed)
      return
    }
    const drawer = region && this.#drawerOf(region)
    const shown = parseDesignerPanels(this.panels)
    const listed = shown === undefined || shown.has(name)
    if (drawer !== undefined) {
      const open = this.#drawer === drawer && listed
      this.#drawer = open ? undefined : drawer
      if (!listed)
        this.#setPanel(name, true)
      else
        this.requestUpdate()
      return
    }
    this.#setPanel(name, shown !== undefined && !shown.has(name))
  }

  /** 这个区所在的位置在分隔条上收起着时为那个位置；窄屏时左右两侧在抽屉里，不算。 */
  #collapsedOf(region: DesignerFrameRegion): DesignerFrameResizable | undefined {
    const position = region.position
    if (position !== 'start' && position !== 'end' && position !== 'bottom')
      return undefined
    if (this.#drawerOf(region) !== undefined || !this.#collapsed.has(position))
      return undefined
    return position
  }

  /** 记下分隔条报来的大小：收到 0 记作收起，保留收起前的大小；还没记过时收起前的大小就是建出来时的 built。 */
  #record(position: DesignerFrameResizable, size: number, built: number): void {
    if (size <= COLLAPSED_SIZE) {
      this.#collapsed.add(position)
      if (this.#current[position] === undefined && built > COLLAPSED_SIZE)
        this.#current[position] = built
      return
    }
    this.#collapsed.delete(position)
    this.#current[position] = size
  }

  /** 把收起的位置按收起前的大小放回：重排一次；refocus 给了就把焦点放回重排后的那条分隔条。 */
  #expand(position: DesignerFrameResizable, refocus?: FrameTriggerRef): void {
    this.#collapsed.delete(position)
    this.#refocus = refocus
    this.#layoutKey = ''
    this.requestUpdate()
  }

  /** 重排后把焦点放回刚才按着的那条分隔条。 */
  #restoreFocus(): void {
    const refocus = this.#refocus
    this.#refocus = undefined
    if (refocus === undefined)
      return
    const splitter = this.#splitters.find(item => item.element.getAttribute('orientation') === refocus.orientation)?.element
    const trigger = splitter?.querySelector<HTMLElement>(`:scope > [data-xh-part="root"] > [data-xh-part="resize-trigger"][index="${refocus.index}"]`)
    if (splitter && trigger)
      void splitter.updateComplete.then(() => trigger.focus())
  }

  /** 窄屏时这个区收在哪一侧的抽屉里；不在抽屉里时为 undefined。 */
  #drawerOf(region: DesignerFrameRegion): DrawerPosition | undefined {
    return this.#narrow && (region.position === 'start' || region.position === 'end') ? region.position : undefined
  }

  /** 收起一块面板：从 panels 里去掉它，派发 panels-change；窄屏时左右两侧的区只是收起抽屉。 */
  #closePanel(name: string): void {
    const region = this.#regionList().find(item => item.name === name)
    if (region && this.#drawerOf(region) !== undefined) {
      this.#drawer = undefined
      this.requestUpdate()
      return
    }
    this.#setPanel(name, false)
  }

  /** 把一块面板列进或移出 panels，派发 panels-change；没写 panels 时先当作全部列着。 */
  #setPanel(name: string, on: boolean): void {
    const shown = parseDesignerPanels(this.panels)
    const visible = this.#regionList()
      .filter(region => region.position !== 'center' && (region.name === name ? on : shown === undefined || shown.has(region.name)))
      .map(region => region.name)
    const panels = visible.join(' ')
    this.panels = panels
    emitEvent(this, 'panels-change', { panels })
  }

  #layout(): Layout {
    const layout: Record<DesignerFramePosition, DesignerFrameRegion[]> = { header: [], top: [], start: [], center: [], end: [], bottom: [], status: [] }
    for (const region of this.#regionList()) {
      if (this.showsPanel(region.name))
        layout[region.position].push(region)
    }
    return layout
  }

  /** 一个位置的下限（百分比）：区登记的与尺寸槽算出的取大的。 */
  #minOf(position: DesignerFrameResizable, regions: readonly DesignerFrameRegion[]): number {
    return Math.max(regions[0]?.minSize ?? DEFAULT_MIN_SIZE, this.#measuredMin[position] ?? 0)
  }

  /** 位置的大小，夹在它的下限与 room 之间；room 是中间区留够下限后还剩的百分比。 */
  #sizeOf(position: DesignerFrameResizable, regions: readonly DesignerFrameRegion[], room: number): number {
    const min = this.#minOf(position, regions)
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
    const nodes = regions.map(region => this.#regions.get(region.name)!.element)
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

  /**
   * 两块以上面板的 <xh-splitter>：sizes 与 panels 按面板顺序，triggers 为每条分隔条名称里的区名，record 记下拖动后的大小。
   * collapsible 的面板在分隔条上双击或按 Enter 收起与展开。collapsed 的面板建出来就收着，这个分隔条不知道它收起前的大小，
   * 在它两侧双击或按 Enter 时由外框按记下的大小放回。
   */
  #splitter(orientation: 'horizontal' | 'vertical', panels: readonly FramePanel[], triggers: readonly string[], record: (sizes: readonly number[]) => void): HTMLElement {
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
      'panels': JSON.stringify(panels.map(panel => ({ id: panel.id, min: Math.round(panel.min * 1000) / 1000, ...(panel.collapsible ? { collapsible: true } : {}) }))),
      'data-scope': SCOPE,
      'data-part': 'splitter',
      'data-orientation': orientation,
    }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, children)]) as XhSplitterElement
    this.#splitters.push({ element: splitter, triggers })
    const expandBuiltCollapsed = (event: Event): void => {
      if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter')
        return
      const trigger = (event.target as Element).closest('[data-xh-part="resize-trigger"]')
      if (!trigger || trigger.closest('xh-splitter') !== splitter)
        return
      const index = Number(trigger.getAttribute('index'))
      const side = [panels[index], panels[index + 1]].find(panel => panel?.collapsed === true && this.#collapsed.has(panel.id as DesignerFrameResizable))
      if (side === undefined)
        return
      event.preventDefault()
      event.stopPropagation()
      this.#expand(side.id as DesignerFrameResizable, { orientation, index })
    }
    splitter.addEventListener('dblclick', expandBuiltCollapsed, true)
    splitter.addEventListener('keydown', expandBuiltCollapsed, true)
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
        this.#regions.get(region.name)!.element.setAttribute('data-position', position)
    }
    parts.header.replaceChildren(...layout.header.map(region => this.#regions.get(region.name)!.element))
    parts.header.hidden = layout.header.length === 0
    parts.top.replaceChildren(...layout.top.map(region => this.#regions.get(region.name)!.element))
    parts.top.hidden = layout.top.length === 0
    parts.status.replaceChildren(...layout.status.map(region => this.#regions.get(region.name)!.element))
    parts.status.hidden = layout.status.length === 0
    // 不显示的顶栏、状态栏区仍要在文档里，作者内容搬进它的段里才看得到有没有内容
    const parked = [...this.#regionList()].filter(region => ZONES[region.position] !== undefined && !layout[region.position].includes(region))
    for (const region of parked) {
      const element = this.#regions.get(region.name)!.element
      element.hidden = true
      parts.status.append(element)
    }
    for (const region of [...layout.header, ...layout.status])
      this.#regions.get(region.name)!.element.hidden = false

    let main: HTMLElement = this.#stack(layout.center, 'center')
    if (layout.bottom.length > 0) {
      const collapsed = this.#collapsed.has('bottom')
      const bottom = collapsed ? 0 : this.#sizeOf('bottom', layout.bottom, 100 - CENTER_MIN_SIZE)
      main = this.#splitter('vertical', [
        { node: main, id: 'center', size: 100 - bottom, min: CENTER_MIN_SIZE },
        { node: this.#stack(layout.bottom, 'bottom'), id: 'bottom', size: bottom, min: this.#minOf('bottom', layout.bottom), collapsible: true, collapsed },
      ], [layout.bottom[0]!.name], next => this.#record('bottom', next[1]!, bottom))
    }

    if (this.#narrow) {
      // 窄屏：中间一列占满整行，左右两侧的区收进抽屉
      const drawers: HTMLElement[] = []
      for (const position of ['start', 'end'] as const) {
        if (layout[position].length === 0) {
          this.#drawers[position]?.body.replaceChildren()
          continue
        }
        const drawer = this.#ensureDrawer(position)
        drawer.body.replaceChildren(this.#stack(layout[position], position))
        drawers.push(drawer.element)
      }
      parts.body.replaceChildren(createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'main' }, [main]), ...drawers)
      return
    }

    const row: FramePanel[] = []
    const triggers: string[] = []
    const startCollapsed = this.#collapsed.has('start')
    const endCollapsed = this.#collapsed.has('end')
    const start = layout.start.length > 0 && !startCollapsed ? this.#sizeOf('start', layout.start, 100 - CENTER_MIN_SIZE - (layout.end.length > 0 && !endCollapsed ? this.#minOf('end', layout.end) : 0)) : 0
    const end = layout.end.length > 0 && !endCollapsed ? this.#sizeOf('end', layout.end, 100 - CENTER_MIN_SIZE - start) : 0
    if (layout.start.length > 0) {
      row.push({ node: this.#stack(layout.start, 'start'), id: 'start', size: start, min: this.#minOf('start', layout.start), collapsible: true, collapsed: startCollapsed })
      triggers.push(layout.start[0]!.name)
    }
    row.push({ node: createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'main' }, [main]), id: 'center', size: 100 - start - end, min: CENTER_MIN_SIZE })
    if (layout.end.length > 0) {
      row.push({ node: this.#stack(layout.end, 'end'), id: 'end', size: end, min: this.#minOf('end', layout.end), collapsible: true, collapsed: endCollapsed })
      triggers.push(layout.end[0]!.name)
    }
    parts.body.replaceChildren(row.length > 1
      ? this.#splitter('horizontal', row, triggers, (next) => {
          row.forEach((panel, index) => {
            if (panel.id === 'start' || panel.id === 'end')
              this.#record(panel.id, next[index]!, panel.size)
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
