/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-frame>：设计器外框。按命名区布局：最上一条顶栏、下面一条（工具栏），中间一行左、中、右三栏，
// 中间一列的下方一栏，最下一条状态栏。区名由产品登记，作者内容用 slot="<区名>" 放进对应的区，没写 slot 的放进中间区。
// 左、右、下三栏里的区是面板：按布局（layout）停在哪一栏、先后、显隐、收成标题条、浮出成小窗，改了就派发 layout-change。
// 给了标题的面板画成卡片：面板头写标题与副标题，右侧是操作区、帮助、收起、「更多」与关闭；按住面板头可以拖到别的栏或画布上。
// 画布浮动件（position 为 overlay）按 anchor 放进画布区的角上，只能显示或隐藏。
// 区间用 <xh-splitter>，宽度可拖；同一栏上下堆叠的几块面板之间也有分隔条，缺省等分。
// 视口窄于 --xh-breakpoint-md 时进窄屏：中间一列占满整行，左右两栏收进从两边滑出的抽屉，缺省收着，由「面板」开关；浮出的面板按停靠显示。

import type { IconRecord } from '@xihan-ui/core'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { XhDrawerElement, XhFloatingPanelElement, XhMenuElement, XhSplitterElement } from '@xihan-ui/web-components/define'
import type { DesignerFrameTranslations } from '../translations'
import type { DesignerLayout, DesignerLayoutDock, DesignerLayoutPolicy, DesignerLayoutRect, ResolvedDesignerLayout } from './layout'
import { createAuthoredElement, createGeneratedElement, emitEvent, setAttributes, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { registerDropTarget, startDrag } from '../drag/drag'
import { adoptSlots } from '../internal/slots'
import { defineFrameElements } from '../internal/ui-elements'
import {
  defaultDesignerLayout,
  DESIGNER_LAYOUT_DOCKS,
  designerLayoutEquals,
  designerPanelAbilities,
  designerPanelDock,
  isDesignerDockRegion,
  resolveDesignerLayout,
  withDesignerDockSize,
  withDesignerPanelFloating,
  withDesignerPanelMinimized,
  withDesignerPanelMoved,
  withDesignerPanelShares,
  withDesignerPanelVisible,
} from './layout'

/** 外框搭的一条分隔条：分隔条按顺序调整的区名。 */
interface FrameSplitter {
  readonly element: XhSplitterElement
  readonly triggers: readonly string[]
}

/** 分隔条里的一块面板：collapsed 的建出来就收着；fixed 的大小钉死（收成标题条的面板）。 */
interface FramePanel {
  readonly node: HTMLElement
  readonly id: string
  readonly size: number
  readonly min: number
  readonly collapsible?: boolean
  readonly collapsed?: boolean
  readonly fixed?: boolean
}

/** 外框里的一条分隔条：所在分栏的方向与它的序号。 */
interface FrameTriggerRef {
  readonly orientation: 'horizontal' | 'vertical'
  readonly index: number
}

/** 窄屏时收进抽屉的两侧。 */
type DrawerPosition = 'start' | 'end'

/** 窄屏时一侧的抽屉：抽屉元素与放区的正文。 */
interface FrameDrawer {
  readonly element: XhDrawerElement
  readonly content: HTMLElement
  readonly body: HTMLElement
}

/** 一块浮出的面板：小窗与它的各部件。 */
interface FrameFloat {
  readonly element: XhFloatingPanelElement
  readonly title: HTMLElement
  readonly icon: HTMLElement & { icon?: IconRecord }
  readonly body: HTMLElement
  readonly dock: HTMLButtonElement
  readonly minimize: HTMLButtonElement
  readonly restore: HTMLButtonElement
  readonly close: HTMLButtonElement
  readonly drag: HTMLButtonElement
}

/** 进窄屏的断点令牌：视口窄于它就进窄屏。 */
const NARROW_BREAKPOINT = '--xh-breakpoint-md'

/**
 * 区的位置：最上的顶栏、下面一条、中间一行的左、中、右、中间一列的下方、最下的状态栏，以及画布浮动件。
 * 左、右、下三个位置上的区是面板，这里写的是它缺省停的栏，用户可以挪。
 */
export type DesignerFramePosition = 'header' | 'top' | 'start' | 'center' | 'end' | 'bottom' | 'status' | 'overlay'

/** 可以拖动调整大小的位置，也就是三栏。 */
export type DesignerFrameResizable = DesignerLayoutDock

/** 画布浮动件落在画布区的哪个角上，或右侧中间。 */
export type DesignerFrameOverlayAnchor = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'end'

/** 一个命名区，也就是面板的登记。区名是面板 id，同一栏的多块面板按登记顺序上下排列。 */
export interface DesignerFrameRegion {
  /** 区名：写 slot="<区名>" 的子元素放进这个区，布局里也按它认面板。 */
  readonly name: string
  /** 区的位置；左、右、下是面板缺省停的栏。 */
  readonly position: DesignerFramePosition
  /** 所在栏的缺省大小（百分比）：左右两栏占中间一行的宽度，下方一栏占中间一列的高度；取那一栏第一块面板的值。 */
  readonly size?: number
  /** 拖动时所在栏的下限（百分比），缺省 10；取那一栏第一块面板的值。外框按尺寸槽算出的下限更大时以那个为准。 */
  readonly minSize?: number
  /** 分隔条无障碍名称里的区名，缺省用 title，再缺省用 name。 */
  readonly label?: string
  /** 面板头的标题：给了就把这块面板画成卡片，头部写标题；只对左、右、下三个位置生效。 */
  readonly title?: string
  /** 面板头标题下的一行副标题，如属性面板当前对象的名字。 */
  readonly subtitle?: string
  /** 面板头的帮助：给了就在右上角出帮助钮，悬停或聚焦时弹出这段说明。 */
  readonly help?: string
  /** 面板的图标：面板菜单、浮出小窗的标题栏里用。 */
  readonly icon?: IconRecord
  /** position 为 overlay 时落在画布区的哪里，缺省 bottom-end。 */
  readonly anchor?: DesignerFrameOverlayAnchor
  /** 缺省不显示。 */
  readonly defaultHidden?: boolean
  /** 能隐藏（面板头出关闭钮），缺省 true。 */
  readonly closable?: boolean
  /** 能换栏、调序，缺省 true。 */
  readonly movable?: boolean
  /** 能浮出成小窗，缺省 true。 */
  readonly floatable?: boolean
  /** 能收成标题条，缺省 true。 */
  readonly minimizable?: boolean
}

/** layout-change 的起因。 */
export type DesignerLayoutChangeReason = 'toggle' | 'move' | 'minimize' | 'float' | 'dock' | 'resize' | 'reset'

/** 面板菜单里的一项：能停靠的面板与画布浮动件。 */
export interface DesignerPanelEntry {
  readonly name: string
  /** 依次取 title、label、name。 */
  readonly label: string
  readonly icon?: IconRecord
  /** 此刻看得见：没隐藏，所在栏没在分隔条上收起；窄屏时左右两栏的面板还要它所在的抽屉开着。 */
  readonly shown: boolean
  /** 停在哪一栏；画布浮动件没有。 */
  readonly dock?: DesignerLayoutDock
  readonly minimized: boolean
  readonly floating: boolean
  /** 宿主锁定了这块面板或整份布局。 */
  readonly locked: boolean
}

/** 外框派发的事件。 */
export interface DesignerFrameEventMap {
  /** 布局变了：layout 是改完的整份，外框已经换成它；拖分隔条只在松手时派发。 */
  'layout-change': CustomEvent<{ layout: ResolvedDesignerLayout, reason: DesignerLayoutChangeReason }>
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

/** 画布区上浮动条的落点：作者内容写 slot="<中间区名>-<落点>"，画布浮动件也落在这里。 */
const OVERLAYS: readonly DesignerFrameOverlayAnchor[] = ['top-start', 'top-end', 'bottom-start', 'bottom-end', 'end']

const DEFAULT_TRANSLATIONS: DesignerFrameTranslations = {
  layout: 'Designer layout',
  resize: label => `Resize ${label}`,
  closePanel: label => `Close ${label}`,
  panelHelp: label => `About ${label}`,
  minimizePanel: label => `Collapse ${label}`,
  expandPanel: label => `Expand ${label}`,
  panelMenu: label => `More actions for ${label}`,
  dockPanel: label => `Dock ${label}`,
  moveLeft: 'Move to left side',
  moveRight: 'Move to right side',
  moveBottom: 'Move to bottom',
  moveUp: 'Move up',
  moveDown: 'Move down',
  float: 'Float',
  dock: 'Dock',
  minimize: 'Collapse to title',
  expand: 'Expand',
  hide: 'Hide',
  dockLeft: 'left side',
  dockRight: 'right side',
  dockBottom: 'bottom',
  announceMoved: (label, dock, position) => `${label} moved to ${dock}, position ${position}`,
  announceFloated: label => `${label} floated`,
  announceDocked: (label, dock) => `${label} docked to ${dock}`,
  announceMinimized: label => `${label} collapsed`,
  announceExpanded: label => `${label} expanded`,
  announceHidden: label => `${label} hidden`,
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
/** 浮出的小窗缺省大小（像素），不超过外框的八成。 */
const FLOAT_WIDTH = 320
const FLOAT_HEIGHT = 360
/** 小窗挪动、改尺之后多久派发一次 layout-change（毫秒）。 */
const FLOAT_SETTLE = 300
/** 小窗的改尺把手。 */
const RESIZE_EDGES = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'] as const

/** 拖面板时交给放置目标的数据。 */
interface PanelDragPayload {
  readonly kind: 'designer-panel'
  readonly frame: XhDesignerFrameElement
  readonly id: string
  /** 按下处离卡片左上角的距离（像素），浮出时小窗按它落位。 */
  readonly grab: { readonly x: number, readonly y: number }
  readonly size: { readonly width: number, readonly height: number }
}

/** 落点提示的位置（视口坐标）。 */
interface DropLine {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** 拖面板时指针下的落点。 */
type PanelDrop
  = | { readonly kind: 'dock', readonly dock: DesignerLayoutDock, readonly index: number, readonly edge: boolean, readonly line: DropLine }
    | { readonly kind: 'float', readonly rect: DesignerLayoutRect }

interface Parts {
  readonly header: HTMLElement
  readonly top: HTMLElement
  readonly body: HTMLElement
  readonly status: HTMLElement
  /** 量尺寸槽用的隐形块：左右与下方的下限，以及面板头的高度。 */
  readonly probes: Readonly<Record<DesignerFrameResizable, HTMLElement>> & { readonly folded: HTMLElement }
  /** 拖面板时盖在三栏与画布上的落点层，里面画停靠条与插入线。 */
  readonly drop: HTMLElement
  readonly dropLine: HTMLElement
  readonly floats: HTMLElement
  /** 礼貌级播报。 */
  readonly live: HTMLElement
}

/** 一个区的容器与它生成的部件。 */
interface RegionParts {
  readonly element: HTMLElement
  /** 作者内容放进哪里：卡片放在 panel-body，其余放在区本身。 */
  readonly content: HTMLElement
  /** 顶栏、状态栏的分段，画布区的浮动条落点，卡片的操作区。 */
  readonly zones: Readonly<Record<string, HTMLElement>>
  readonly card?: CardParts
  /** 区结构的签名：种类与是不是卡片变了就重建。 */
  readonly signature: string
}

/** 卡片的面板头。 */
interface CardParts {
  readonly header: HTMLElement
  readonly title: HTMLElement
  readonly subtitle: HTMLElement
  readonly actions: HTMLElement
  readonly help: HTMLElement & { disabled?: boolean }
  readonly helpTrigger: HTMLElement
  readonly helpContent: HTMLElement
  readonly minimize: HTMLButtonElement
  readonly menuTrigger: HTMLButtonElement
  readonly close: HTMLButtonElement
}

/** 一轮排版：各位置此刻显示的区。 */
interface Plan {
  readonly header: readonly DesignerFrameRegion[]
  readonly top: readonly DesignerFrameRegion[]
  readonly center: readonly DesignerFrameRegion[]
  readonly status: readonly DesignerFrameRegion[]
  readonly docks: Readonly<Record<DesignerLayoutDock, readonly DesignerFrameRegion[]>>
  readonly overlays: readonly DesignerFrameRegion[]
  readonly floating: readonly DesignerFrameRegion[]
}

type MenuNode = NonNullable<XhMenuElement['collection']>[number]

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/** 堆叠面板的下限：缺省 10%，面板多到放不下时取等分。 */
/** 收成标题条的一张卡片占的高度：边框盒加上下外边距；量不出来时为 0。 */
function foldedCardHeight(card: HTMLElement): number {
  const height = card.offsetHeight
  if (height <= 0)
    return 0
  const style = card.ownerDocument.defaultView?.getComputedStyle(card)
  return height + (Number.parseFloat(style?.marginBlockStart ?? '') || 0) + (Number.parseFloat(style?.marginBlockEnd ?? '') || 0)
}

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

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** 点在不在矩形里。 */
function within(rect: { left: number, top: number, right: number, bottom: number }, x: number, y: number): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

export class XhDesignerFrameElement extends XhReactiveElement {
  static override properties = {
    regions: { attribute: false },
    layout: { attribute: false },
    defaultLayout: { attribute: false },
    layoutPolicy: { attribute: false },
    translations: { attribute: false },
  }

  /** 命名区，缺省为 DESIGNER_FRAME_REGIONS。 */
  declare regions: readonly DesignerFrameRegion[] | undefined
  /** 面板布局；不给即缺省布局。外框改了布局就换成改完的整份，并派发 layout-change。 */
  declare layout: DesignerLayout | undefined
  /** 宿主的缺省布局：用户没存过布局时用它，「恢复默认布局」也回到它；写了的字段整项覆盖内置缺省。 */
  declare defaultLayout: DesignerLayout | undefined
  /** 宿主对布局的管控，通常由 designerLayoutPolicy(settingsPolicy) 换算得来。 */
  declare layoutPolicy: DesignerLayoutPolicy | undefined
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerFrameTranslations> | undefined

  /** 注册外框用到的库内元素。 */
  static defineDependencies(): void {
    defineFrameElements()
  }

  readonly #config = new XhConfigController(this)
  #parts: Parts | undefined
  readonly #regions = new Map<string, RegionParts>()
  readonly #floats = new Map<string, FrameFloat>()
  #releaseSlots: (() => void) | undefined
  #slotsKey = ''
  #layoutKey = ''
  #splitters: FrameSplitter[] = []
  /** 此刻的整份布局：属性合成出来的，加上分隔条、小窗还没派发出去的改动。 */
  #state: ResolvedDesignerLayout | undefined
  /** 最后一次派发出去（或从属性收到）的那一份。 */
  #emitted: ResolvedDesignerLayout | undefined
  /** #state 是按哪一组 regions、layout、defaultLayout、layoutPolicy 算的。 */
  #inputs: readonly unknown[] | undefined
  /** 「全部隐藏」前隐藏着的面板，「全部显隐」再按一次时放回。 */
  #stash: readonly string[] | undefined
  /** 重排后要把焦点放回的分隔条。 */
  #refocus: FrameTriggerRef | undefined
  /** 尺寸槽折成的下限（百分比），量不出来时没有。 */
  #measuredMin: Partial<Record<DesignerFrameResizable, number>> = {}
  /** 收成标题条的一张卡片连同上下间距的像素高度，收成标题条的面板按它钉高度。 */
  #foldedHeight = 0
  /** 中间一行的像素高度，收成标题条的面板按它折百分比。 */
  #bodyHeight = 0
  #dirObserver: MutationObserver | undefined
  #zoneObserver: MutationObserver | undefined
  #resizeObserver: ResizeObserver | undefined
  #releaseDrop: (() => void) | undefined
  #ids = 0
  /** 视口窄于断点：左右两栏收进抽屉。 */
  #narrow = false
  #narrowQuery: MediaQueryList | undefined
  /** 窄屏时开着的那一侧抽屉；同时只开一侧。 */
  #drawer: DrawerPosition | undefined
  readonly #drawers: Partial<Record<DrawerPosition, FrameDrawer>> = {}
  /** 拖面板时此刻的落点。 */
  #drop: PanelDrop | undefined
  #floatTimer: ReturnType<typeof setTimeout> | undefined
  /** 正按着分隔条拖：拖动中的大小等松手再派发。 */
  #resizing = false
  #liveTimer: ReturnType<typeof setTimeout> | undefined
  readonly #onNarrowChange = (): void => {
    const narrow = this.#narrowQuery !== undefined && !this.#narrowQuery.matches
    if (narrow === this.#narrow)
      return
    this.#narrow = narrow
    this.#drawer = undefined
    this.requestUpdate()
  }

  readonly #onPointerUp = (): void => {
    if (!this.#resizing)
      return
    this.#resizing = false
    if (!this.layoutPolicy?.locked)
      this.#flush('resize')
  }

  readonly #onScroll = (): void => {
    if (this.#floats.size > 0)
      this.#placeFloats()
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
    this.#releaseDrop?.()
    this.#releaseDrop = registerDropTarget<unknown>(this, {
      over: (point, payload) => this.#dragOver(point, payload),
      drop: (point, payload) => this.#dragDrop(point, payload),
      leave: () => this.#dragLeave(),
    })
    this.ownerDocument.addEventListener('scroll', this.#onScroll, { capture: true, passive: true })
    this.ownerDocument.addEventListener('pointerup', this.#onPointerUp, true)
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

  /** 视口窄于断点（--xh-breakpoint-md）时为真：中间一列占满整行，左右两栏收进抽屉。 */
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
    this.#releaseDrop?.()
    this.#releaseDrop = undefined
    this.ownerDocument.removeEventListener('scroll', this.#onScroll, { capture: true })
    this.ownerDocument.removeEventListener('pointerup', this.#onPointerUp, true)
    this.#narrowQuery?.removeEventListener('change', this.#onNarrowChange)
    this.#narrowQuery = undefined
    if (this.#floatTimer !== undefined) {
      clearTimeout(this.#floatTimer)
      this.#floatTimer = undefined
      this.#flush('float')
    }
  }

  /** 此刻的整份布局：没连上文档前按属性现合成。 */
  get resolvedLayout(): ResolvedDesignerLayout {
    return this.#state !== undefined && !this.#inputsChanged() ? this.#state : this.#resolve()
  }

  /** 宿主赋过 regions、layout、defaultLayout 或 layoutPolicy，外框还没按它们更新。 */
  #inputsChanged(): boolean {
    const inputs = this.#inputs
    return inputs === undefined || inputs[0] !== this.regions || inputs[1] !== this.layout || inputs[2] !== this.defaultLayout || inputs[3] !== this.layoutPolicy
  }

  #recordInputs(): void {
    this.#inputs = [this.regions, this.layout, this.defaultLayout, this.layoutPolicy]
  }

  #resolve(): ResolvedDesignerLayout {
    return resolveDesignerLayout(this.#regionList(), this.layout, this.defaultLayout, this.layoutPolicy)
  }

  /** 这个区是否显示：中间区与工具栏总是显示；顶栏、状态栏看有没有内容；面板与画布浮动件看布局（浮出的也算）。 */
  showsPanel(name: string): boolean {
    const region = this.#regionList().find(item => item.name === name)
    if (region === undefined)
      return false
    if (region.position === 'center' || region.position === 'top')
      return true
    if (region.position === 'header' || region.position === 'status')
      return this.#hasContent(name)
    if (this.layoutPolicy?.panels?.[name] === 'hidden')
      return false
    return !this.resolvedLayout.hidden.includes(name)
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    this.#syncRegions()
    let external = false
    if (this.#state === undefined || changed.has('regions') || changed.has('layout') || changed.has('defaultLayout') || changed.has('layoutPolicy')) {
      const next = this.#resolve()
      if (this.#state === undefined || !designerLayoutEquals(next, this.#state)) {
        external = this.#state !== undefined && changed.has('layout')
        this.#state = next
      }
      if (changed.has('layout') || this.#emitted === undefined)
        this.#emitted = this.#state
      this.#recordInputs()
    }
    const t = this.#translations()
    const plan = this.#plan()
    const minimized = this.#state!.minimized.length > 0
    const mins = (['start', 'end', 'bottom'] as const).map(position => Math.round((this.#measuredMin[position] ?? 0) / MIN_SIZE_EPSILON))
    const key = JSON.stringify([
      this.#direction(),
      mins,
      this.#narrow,
      Object.entries(plan).map(([position, regions]) => [position, Array.isArray(regions) ? regions.map(region => region.name) : Object.entries(regions as Plan['docks']).map(([dock, items]) => [dock, items.map(region => region.name)])]),
      this.#state!.minimized,
      minimized ? [Math.round(this.#foldedHeight), Math.round(this.#bodyHeight / 8)] : 0,
    ])
    if (key !== this.#layoutKey || external) {
      this.#layoutKey = key
      this.#build(parts, plan)
      this.#restoreFocus()
    }
    for (const region of this.#regionList()) {
      const card = this.#regions.get(region.name)?.card
      if (card)
        this.#paintCard(region, card, t)
    }
    this.#paintFloats(plan, t)
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
      const regions = plan.docks[position]
      const open = this.#narrow && this.#drawer === position && regions.length > 0
      if (drawer.element.open !== open)
        drawer.element.open = open
      drawer.element.side = this.#sideOf(position)
      drawer.content.setAttribute('aria-label', regions.map(region => region.title ?? region.label ?? region.name).join('、'))
    }
  }

  #translations(): DesignerFrameTranslations {
    return this.#config.translations<DesignerFrameTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
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

  #regionOf(name: string): DesignerFrameRegion | undefined {
    return this.#regionList().find(region => region.name === name)
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
    const foldedProbe = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'region', 'data-card': '', 'data-minimized': '', 'data-probe': '' }, [
      createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-header' }, [
        createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-heading' }, [
          createGeneratedElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-title' }, [' ']),
        ]),
        createGeneratedElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-close' }),
      ]),
    ])
    const probes = { start: probe('start'), end: probe('end'), bottom: probe('bottom'), folded: foldedProbe }
    const probeBox = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'probes', 'aria-hidden': 'true' }, Object.values(probes))
    const dropLine = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'drop-line' })
    const drop = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'drop', 'aria-hidden': 'true' }, [
      ...DESIGNER_LAYOUT_DOCKS.map(dock => createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'drop-edge', 'data-dock': dock })),
      dropLine,
    ])
    const floats = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'floats' })
    const live = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'live', 'role': 'status', 'aria-live': 'polite' })
    this.append(header, top, body, status, probeBox, drop, floats, live)
    this.#parts = { header, top, body, status, probes, drop, dropLine, floats, live }
    return this.#parts
  }

  /** 把尺寸槽给的下限（像素）折成占外框的百分比，量出面板头与中间一行的高度；变化够大时重排。 */
  #measure(): void {
    const parts = this.#parts
    if (!parts)
      return
    if (this.#floats.size > 0)
      this.#placeFloats()
    const width = parts.body.clientWidth
    const height = parts.body.clientHeight
    const next: Partial<Record<DesignerFrameResizable, number>> = {}
    for (const position of ['start', 'end', 'bottom'] as const) {
      const extent = position === 'bottom' ? height : width
      const size = position === 'bottom' ? parts.probes[position].offsetHeight : parts.probes[position].offsetWidth
      if (extent > 0 && size > 0)
        next[position] = Math.min(size / extent * 100, 100 - CENTER_MIN_SIZE)
    }
    const header = foldedCardHeight(parts.probes.folded)
    const changed = (['start', 'end', 'bottom'] as const).some(position => Math.abs((next[position] ?? 0) - (this.#measuredMin[position] ?? 0)) >= MIN_SIZE_EPSILON)
    const stack = Math.abs(header - this.#foldedHeight) >= 1 || Math.abs(height - this.#bodyHeight) >= 8
    this.#foldedHeight = header
    this.#bodyHeight = height
    if (!changed && !(stack && (this.#state?.minimized.length ?? 0) > 0))
      return
    this.#measuredMin = next
    this.requestUpdate()
  }

  #nextId(part: string): string {
    this.#ids += 1
    return `xh-designer-frame-${part}-${this.#ids}`
  }

  /** 区的种类：能停靠的面板不论停在哪一栏都是同一种，换栏不重建。 */
  #kindOf(region: DesignerFrameRegion): string {
    return isDesignerDockRegion(region) ? 'dock' : region.position
  }

  /** 一个区的结构：卡片带面板头，顶栏与状态栏分段，画布区带浮动条的落点。 */
  #createRegion(region: DesignerFrameRegion): RegionParts {
    const doc = this.ownerDocument
    const card = isDesignerDockRegion(region) && region.title !== undefined
    const center = region.position === 'center'
    const signature = `${this.#kindOf(region)}:${card}`
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
    const minimize = createAuthoredElement(doc, 'button', { 'type': 'button', 'data-scope': SCOPE, 'data-part': 'panel-minimize' }) as HTMLButtonElement
    minimize.addEventListener('click', () => this.setPanelMinimized(region.name, !this.resolvedLayout.minimized.includes(region.name)))
    const menuTrigger = createAuthoredElement(doc, 'button', { 'type': 'button', 'aria-haspopup': 'menu', 'data-scope': SCOPE, 'data-part': 'panel-menu-trigger' }) as HTMLButtonElement
    // 菜单第一次点开时才建：没有条目的 <xh-menu> 升级时会报缺部件
    let menu: XhMenuElement | undefined
    const ensureMenu = (): XhMenuElement => {
      if (menu)
        return menu
      const host = createAuthoredElement(doc, 'xh-menu') as XhMenuElement
      host.open = false
      host.anchor = menuTrigger
      host.collection = this.#menuItems(region.name)
      host.addEventListener('open-change', (event) => {
        if (event.target !== host)
          return
        event.stopPropagation()
        menuTrigger.setAttribute('aria-expanded', String((event as CustomEvent<{ open: boolean }>).detail.open))
      })
      host.addEventListener('select', (event) => {
        event.stopPropagation()
        this.#runMenuAction(region.name, (event as CustomEvent<{ value: string }>).detail.value)
      })
      menuTrigger.after(host)
      menu = host
      return host
    }
    menuTrigger.addEventListener('click', () => {
      if (menu?.open) {
        menu.open = false
        return
      }
      const panelMenu = ensureMenu()
      panelMenu.collection = this.#menuItems(region.name)
      panelMenu.translations = { content: this.#translations().panelMenu(region.title ?? region.name) }
      panelMenu.open = true
    })
    const close = createAuthoredElement(doc, 'button', { 'type': 'button', 'data-scope': SCOPE, 'data-part': 'panel-close' }) as HTMLButtonElement
    close.addEventListener('click', () => this.#closePanel(region.name))
    const header = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-header' }, [
      createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-heading' }, [title, subtitle]),
      actions,
      help,
      minimize,
      menuTrigger,
      close,
    ])
    header.addEventListener('pointerdown', event => this.#startPanelDrag(event, region.name, element, header))
    header.addEventListener('dblclick', (event) => {
      if (this.#fromControl(event.target, header))
        return
      const abilities = this.#abilities(region.name)
      if (abilities?.minimizable)
        this.setPanelMinimized(region.name, !this.resolvedLayout.minimized.includes(region.name))
    })
    const body = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-body' })
    setAttributes(element, { 'data-card': '', 'role': 'region', 'aria-labelledby': titleId })
    element.append(header, body)
    return { element, content: body, zones: { actions }, signature, card: { header, title, subtitle, actions, help, helpTrigger, helpContent, minimize, menuTrigger, close } }
  }

  /** 事件来自面板头里的按钮、操作区或别的控件，而不是面板头本身。 */
  #fromControl(target: EventTarget | null, header: HTMLElement): boolean {
    for (let node = target instanceof Element ? target : null; node && node !== header; node = node.parentElement) {
      if (node.matches('button, a, input, select, textarea, [role="button"], [contenteditable], [data-part="panel-actions"], xh-menu'))
        return true
    }
    return false
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
      const signature = `${this.#kindOf(region)}:${isDesignerDockRegion(region) && region.title !== undefined}`
      if (existing?.signature === signature)
        continue
      const next = this.#createRegion(region)
      if (existing) {
        const generated = new Set<Element>([...Object.values(existing.zones), ...(existing.card ? [existing.card.header] : [])])
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
        // 撤掉的区里的作者内容放回宿主，这个区再登记时由插槽重新领走
        const existing = this.#regions.get(name)!
        const generated = new Set<Element>([...Object.values(existing.zones), ...(existing.card ? [existing.card.header] : [])])
        orphans.push(...Array.from(existing.content.children).filter(child => !generated.has(child)))
        for (const zone of Object.values(existing.zones))
          orphans.push(...Array.from(zone.children))
        existing.element.remove()
        this.#regions.delete(name)
        this.#floats.get(name)?.element.remove()
        this.#floats.delete(name)
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

  #abilities(name: string): ReturnType<typeof designerPanelAbilities> | undefined {
    const region = this.#regionOf(name)
    return region === undefined ? undefined : designerPanelAbilities(region, this.layoutPolicy)
  }

  /** 面板头随区的描述、布局与文案刷新。 */
  #paintCard(region: DesignerFrameRegion, card: CardParts, t: DesignerFrameTranslations): void {
    const title = region.title ?? region.name
    const layout = this.resolvedLayout
    const abilities = designerPanelAbilities(region, this.layoutPolicy)
    const minimized = layout.minimized.includes(region.name)
    const floating = !this.#narrow && Object.hasOwn(layout.floating, region.name)
    setText(card.title, title)
    setText(card.subtitle, region.subtitle ?? '')
    card.subtitle.hidden = !region.subtitle
    card.actions.hidden = card.actions.childElementCount === 0
    setText(card.helpContent, region.help ?? '')
    card.help.hidden = !region.help
    setAttributes(card.helpTrigger, { 'aria-label': t.panelHelp(title) })
    card.minimize.hidden = floating || !abilities.minimizable
    setAttributes(card.minimize, { 'aria-label': minimized ? t.expandPanel(title) : t.minimizePanel(title), 'aria-expanded': String(!minimized), 'data-state': minimized ? 'closed' : 'open' })
    card.menuTrigger.hidden = floating || this.#menuItems(region.name).length === 0
    setAttributes(card.menuTrigger, { 'aria-label': t.panelMenu(title) })
    card.close.hidden = floating || !abilities.closable
    setAttributes(card.close, { 'aria-label': t.closePanel(title) })
    // 浮出时标题、收起、更多与关闭都在小窗的标题栏上；面板头只剩副标题、操作区与帮助，三样都没有就整条收起
    card.header.hidden = floating && !region.subtitle && card.actions.hidden && !region.help
    const element = this.#regions.get(region.name)!.element
    element.toggleAttribute('data-minimized', minimized && !floating)
    element.toggleAttribute('data-floating', floating)
    element.toggleAttribute('data-movable', abilities.movable || abilities.floatable)
  }

  /** 「更多」菜单的各项：按此刻的布局与能做的事现算。 */
  #menuItems(name: string): MenuNode[] {
    const abilities = this.#abilities(name)
    if (!abilities)
      return []
    const t = this.#translations()
    const layout = this.resolvedLayout
    const dock = designerPanelDock(layout, name)
    const floating = Object.hasOwn(layout.floating, name)
    const items: MenuNode[] = []
    const rtl = this.#direction() === 'rtl'
    if (abilities.movable && dock !== undefined && !this.#narrow) {
      const targets: [DesignerLayoutDock, string][] = [['start', rtl ? t.moveRight : t.moveLeft], ['end', rtl ? t.moveLeft : t.moveRight], ['bottom', t.moveBottom]]
      for (const [target, label] of targets) {
        if (target !== dock || floating)
          items.push({ value: `move:${target}`, label })
      }
    }
    if (abilities.movable && dock !== undefined && !floating) {
      const visible = this.#plan().docks[dock].map(region => region.name)
      const at = visible.indexOf(name)
      if (at > 0)
        items.push({ value: 'move:up', label: t.moveUp, ...(items.length > 0 ? { separatorBefore: true } : {}) })
      if (at >= 0 && at < visible.length - 1)
        items.push({ value: 'move:down', label: t.moveDown, ...(items.length > 0 && at === 0 ? { separatorBefore: true } : {}) })
    }
    const separate = items.length > 0
    let first = true
    const push = (item: MenuNode): void => {
      items.push(first && separate ? { ...item, separatorBefore: true } : item)
      first = false
    }
    if (abilities.floatable && !this.#narrow)
      push(floating ? { value: 'dock', label: t.dock } : { value: 'float', label: t.float })
    if (abilities.minimizable && !floating)
      push(layout.minimized.includes(name) ? { value: 'expand', label: t.expand } : { value: 'minimize', label: t.minimize })
    if (abilities.closable)
      push({ value: 'hide', label: t.hide })
    return items
  }

  #runMenuAction(name: string, value: string): void {
    const layout = this.resolvedLayout
    const dock = designerPanelDock(layout, name)
    if (value.startsWith('move:') && dock !== undefined) {
      const target = value.slice(5)
      if (target === 'up' || target === 'down') {
        const visible = this.#plan().docks[dock].map(region => region.name)
        const at = visible.indexOf(name)
        const neighbour = visible[target === 'up' ? at - 1 : at + 1]
        if (neighbour === undefined)
          return
        const rest = layout.docks[dock].filter(id => id !== name)
        const index = rest.indexOf(neighbour) + (target === 'up' ? 0 : 1)
        this.movePanel(name, dock, index)
      }
      else if ((DESIGNER_LAYOUT_DOCKS as readonly string[]).includes(target)) {
        this.movePanel(name, target as DesignerLayoutDock)
      }
      return
    }
    if (value === 'float')
      this.floatPanel(name)
    else if (value === 'dock')
      this.dockPanel(name)
    else if (value === 'minimize' || value === 'expand')
      this.setPanelMinimized(name, value === 'minimize')
    else if (value === 'hide')
      this.setPanelVisible(name, false)
  }

  /** 面板菜单里能开关的面板：能停靠的面板与画布浮动件，按登记顺序；closable 为 false 的不列。 */
  panelEntries(): readonly DesignerPanelEntry[] {
    const layout = this.resolvedLayout
    const hidden = new Set(layout.hidden)
    const entries: DesignerPanelEntry[] = []
    for (const region of this.#regionList()) {
      if (!(isDesignerDockRegion(region) || region.position === 'overlay') || region.closable === false || this.layoutPolicy?.panels?.[region.name] === 'hidden')
        continue
      const dock = designerPanelDock(layout, region.name)
      const floating = Object.hasOwn(layout.floating, region.name)
      let shown = !hidden.has(region.name)
      if (shown && dock !== undefined && (!floating || this.#narrow)) {
        if (this.#narrow && dock !== 'bottom')
          shown = this.#drawer === dock
        else
          shown = !layout.collapsed.includes(dock)
      }
      entries.push({
        name: region.name,
        label: region.title ?? region.label ?? region.name,
        ...(region.icon ? { icon: region.icon } : {}),
        shown,
        ...(dock !== undefined ? { dock } : {}),
        minimized: layout.minimized.includes(region.name),
        floating,
        locked: this.layoutPolicy?.locked === true || this.layoutPolicy?.panels?.[region.name] === 'locked',
      })
    }
    return entries
  }

  /**
   * 开关一块面板：显示着就隐藏、隐藏着就显示，派发 layout-change。
   * 所在栏在分隔条上收起着时是把那一栏放回收起前的大小；窄屏时左右两栏的面板是开关它所在那一侧的抽屉（同时只开一侧）。
   */
  togglePanel(name: string): void {
    const layout = this.resolvedLayout
    const dock = designerPanelDock(layout, name)
    const hidden = layout.hidden.includes(name)
    const floating = Object.hasOwn(layout.floating, name) && !this.#narrow
    if (!hidden && dock !== undefined && !floating && !this.#narrow && layout.collapsed.includes(dock)) {
      this.#expand(dock)
      return
    }
    if (this.#narrow && dock !== undefined && dock !== 'bottom') {
      const open = this.#drawer === dock && !hidden
      this.#drawer = open ? undefined : dock
      if (hidden)
        this.setPanelVisible(name, true)
      else
        this.requestUpdate()
      return
    }
    this.setPanelVisible(name, hidden)
  }

  /** 显示或隐藏一块面板。宿主锁定了它、或它不能隐藏时什么都不做。 */
  setPanelVisible(name: string, visible: boolean): void {
    const abilities = this.#abilities(name)
    if (!abilities?.closable || (this.layoutPolicy?.panels?.[name] === 'hidden'))
      return
    const label = this.#labelOf(name)
    this.#commit(withDesignerPanelVisible(this.resolvedLayout, name, visible), 'toggle')
    if (!visible)
      this.announce(this.#translations().announceHidden(label))
  }

  /** 把一块面板停到某一栏的第 index 位（按布局里那一栏的先后算，含隐藏的；缺省末尾），浮着的一并吸回。 */
  movePanel(name: string, dock: DesignerLayoutDock, index?: number): void {
    if (!this.#abilities(name)?.movable)
      return
    const next = withDesignerPanelMoved(this.resolvedLayout, name, dock, index)
    if (this.#commit(next, 'move')) {
      const position = this.#plan().docks[dock].findIndex(region => region.name === name) + 1
      this.announce(this.#translations().announceMoved(this.#labelOf(name), this.#dockLabel(dock), position))
    }
  }

  /** 收成标题条或展开。 */
  setPanelMinimized(name: string, minimized: boolean): void {
    if (!this.#abilities(name)?.minimizable)
      return
    if (this.#commit(withDesignerPanelMinimized(this.resolvedLayout, name, minimized), 'minimize')) {
      const t = this.#translations()
      this.announce(minimized ? t.announceMinimized(this.#labelOf(name)) : t.announceExpanded(this.#labelOf(name)))
    }
  }

  /** 浮出成小窗；rect（相对外框左上角的像素）不给时按卡片此刻的大小放在画布中间。 */
  floatPanel(name: string, rect?: DesignerLayoutRect): void {
    if (!this.#abilities(name)?.floatable)
      return
    const next = withDesignerPanelFloating(this.resolvedLayout, name, this.#clampFloat(rect ?? this.#defaultFloatRect(name)))
    if (this.#commit(next, 'float'))
      this.announce(this.#translations().announceFloated(this.#labelOf(name)))
  }

  /** 把浮出的小窗吸回原来的栏。 */
  dockPanel(name: string): void {
    const layout = this.resolvedLayout
    if (!Object.hasOwn(layout.floating, name) || !this.#abilities(name)?.floatable)
      return
    if (this.#commit(withDesignerPanelFloating(layout, name, undefined), 'dock')) {
      const dock = designerPanelDock(layout, name)
      if (dock !== undefined)
        this.announce(this.#translations().announceDocked(this.#labelOf(name), this.#dockLabel(dock)))
    }
  }

  /**
   * 把显示着的面板亮出来：收在窄屏抽屉里的打开抽屉，所在栏在分隔条上收起的放回，收成标题条的展开。
   * 面板隐藏着、没登记或被宿主藏掉时返回 false。引导与问题定位用。
   */
  revealPanel(name: string): boolean {
    const region = this.#regionOf(name)
    const layout = this.resolvedLayout
    if (!region || layout.hidden.includes(name) || this.layoutPolicy?.panels?.[name] === 'hidden')
      return false
    const dock = designerPanelDock(layout, name)
    if (dock === undefined)
      return true
    if (this.#narrow && dock !== 'bottom') {
      if (this.#drawer !== dock) {
        this.#drawer = dock
        this.requestUpdate()
      }
    }
    else if (!Object.hasOwn(layout.floating, name) && layout.collapsed.includes(dock)) {
      this.#expand(dock)
    }
    if (layout.minimized.includes(name))
      this.#commit(withDesignerPanelMinimized(this.resolvedLayout, name, false), 'minimize')
    return true
  }

  /** 有面板显示着就全部隐藏，否则放回全部隐藏前的那一组（刷新以后按缺省显示）；不动工具栏与状态栏。 */
  toggleAllPanels(): void {
    if (this.layoutPolicy?.locked)
      return
    const layout = this.resolvedLayout
    const closable = this.panelEntries().filter(entry => !entry.locked).map(entry => entry.name)
    const anyShown = closable.some(name => !layout.hidden.includes(name))
    if (anyShown) {
      this.#stash = layout.hidden
      this.#commit({ ...layout, hidden: [...new Set([...layout.hidden, ...closable])] }, 'toggle')
      return
    }
    const back = this.#stash ?? this.#defaults().hidden
    this.#stash = undefined
    const locked = layout.hidden.filter(name => !closable.includes(name))
    this.#commit({ ...layout, hidden: [...new Set([...locked, ...back.filter(name => closable.includes(name))])] }, 'toggle')
  }

  /** 各面板的显隐回到缺省；位置与大小不动。 */
  restorePanels(): void {
    if (this.layoutPolicy?.locked)
      return
    const layout = this.resolvedLayout
    const locked = new Set(this.panelEntries().filter(entry => entry.locked).map(entry => entry.name))
    const defaults = new Set(this.#defaults().hidden)
    const hidden = [...new Set([...layout.hidden.filter(name => locked.has(name)), ...[...defaults].filter(name => !locked.has(name))])]
    this.#stash = undefined
    this.#commit({ ...layout, hidden }, 'toggle')
  }

  /** 整份布局回到缺省（宿主的 defaultLayout 或内置缺省）：显隐、停靠、先后、大小、收起、浮出一起复原。 */
  resetLayout(): void {
    if (this.layoutPolicy?.locked)
      return
    this.#stash = undefined
    this.#commit(this.#defaults(), 'reset')
    this.#layoutKey = ''
    this.requestUpdate()
  }

  /** 读屏播报一句（礼貌级）。 */
  announce(message: string): void {
    const live = this.#parts?.live
    if (!live)
      return
    if (this.#liveTimer !== undefined)
      clearTimeout(this.#liveTimer)
    live.textContent = ''
    // 先清空再写：同一句话连播两次时读屏也能再读一遍
    this.#liveTimer = setTimeout(() => {
      this.#liveTimer = undefined
      live.textContent = message
    }, 50)
  }

  #defaults(): ResolvedDesignerLayout {
    return defaultDesignerLayout(this.#regionList(), this.defaultLayout, this.layoutPolicy)
  }

  #labelOf(name: string): string {
    const region = this.#regionOf(name)
    return region?.title ?? region?.label ?? name
  }

  #dockLabel(dock: DesignerLayoutDock): string {
    const t = this.#translations()
    const rtl = this.#direction() === 'rtl'
    if (dock === 'bottom')
      return t.dockBottom
    return (dock === 'start') !== rtl ? t.dockLeft : t.dockRight
  }

  /** 换成新布局并派发；和此刻那份一样时什么都不做，返回 false。 */
  #commit(next: ResolvedDesignerLayout, reason: DesignerLayoutChangeReason): boolean {
    if (this.#state !== undefined && designerLayoutEquals(next, this.#state))
      return false
    this.#state = next
    this.#flush(reason)
    this.requestUpdate()
    return true
  }

  /** 把还没派发的布局派发出去。 */
  #flush(reason: DesignerLayoutChangeReason): void {
    const state = this.#state
    if (state === undefined || designerLayoutEquals(state, this.#emitted))
      return
    this.#emitted = state
    this.layout = state
    this.#recordInputs()
    emitEvent(this, 'layout-change', { layout: state, reason })
  }

  /** 关掉一块面板：窄屏时左右两栏的面板只是收起抽屉。 */
  #closePanel(name: string): void {
    const dock = designerPanelDock(this.resolvedLayout, name)
    if (this.#narrow && dock !== undefined && dock !== 'bottom') {
      this.#drawer = undefined
      this.requestUpdate()
      return
    }
    this.setPanelVisible(name, false)
  }

  /** 这一轮各位置显示的区。 */
  #plan(): Plan {
    const layout = this.resolvedLayout
    const regions = this.#regionList()
    const byName = new Map(regions.map(region => [region.name, region]))
    const hidden = new Set(layout.hidden)
    const shown = (name: string): boolean => byName.has(name) && !hidden.has(name) && this.layoutPolicy?.panels?.[name] !== 'hidden'
    const docks = {} as Record<DesignerLayoutDock, DesignerFrameRegion[]>
    for (const dock of DESIGNER_LAYOUT_DOCKS)
      docks[dock] = layout.docks[dock].filter(name => shown(name) && (this.#narrow || !Object.hasOwn(layout.floating, name))).map(name => byName.get(name)!)
    const byPosition = (position: DesignerFramePosition): DesignerFrameRegion[] => regions.filter(region => region.position === position)
    return {
      header: byPosition('header').filter(region => this.#hasContent(region.name)),
      top: byPosition('top'),
      center: byPosition('center'),
      status: byPosition('status').filter(region => this.#hasContent(region.name)),
      docks,
      overlays: byPosition('overlay').filter(region => shown(region.name)),
      floating: this.#narrow ? [] : Object.keys(layout.floating).filter(shown).map(name => byName.get(name)!),
    }
  }

  /** 记下分隔条报来的一栏大小：收到 0 记作收起，保留收起前的大小。 */
  #record(dock: DesignerLayoutDock, size: number, built: number): void {
    const layout = this.resolvedLayout
    const collapsed = size <= COLLAPSED_SIZE
    const kept = collapsed ? (layout.sizes[dock] ?? (built > COLLAPSED_SIZE ? built : undefined)) : size
    this.#state = withDesignerDockSize(layout, dock, kept, collapsed)
  }

  /** 把收起的栏按收起前的大小放回：重排一次；refocus 给了就把焦点放回重排后的那条分隔条。 */
  #expand(dock: DesignerLayoutDock, refocus?: FrameTriggerRef): void {
    this.#state = withDesignerDockSize(this.resolvedLayout, dock, undefined, false)
    this.#flush('resize')
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

  /** 一栏的下限（百分比）：第一块面板登记的与尺寸槽算出的取大的。 */
  #minOf(dock: DesignerLayoutDock, regions: readonly DesignerFrameRegion[]): number {
    return Math.max(regions[0]?.minSize ?? DEFAULT_MIN_SIZE, this.#measuredMin[dock] ?? 0)
  }

  /** 一栏的大小，夹在它的下限与 room 之间；room 是中间区留够下限后还剩的百分比。 */
  #sizeOf(dock: DesignerLayoutDock, regions: readonly DesignerFrameRegion[], room: number): number {
    const min = this.#minOf(dock, regions)
    return Math.min(Math.max(this.resolvedLayout.sizes[dock] ?? regions[0]?.size ?? 20, min), Math.max(min, room))
  }

  /** 收成标题条的面板占一栏的百分比：一张收起的卡片连同间距的像素高度按栏高折算；量不出来时为 0。 */
  #headerShare(stackHeight: number, count: number): number {
    if (stackHeight <= 0 || this.#foldedHeight <= 0)
      return 0
    return Math.min(this.#foldedHeight / stackHeight * 100, 100 / count)
  }

  /** 一栏里的面板：一块时直接放进去，多块时上下排列并以分隔条隔开；收成标题条的只占面板头的高度。 */
  #stack(regions: readonly DesignerFrameRegion[], position: DesignerFramePosition, stackHeight: number): HTMLElement {
    const stack = createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'stack', 'data-position': position })
    const nodes = regions.map(region => this.#regions.get(region.name)!.element)
    const minimized = new Set(this.resolvedLayout.minimized)
    const folded = regions.filter(region => minimized.has(region.name) && region.title !== undefined)
    stack.toggleAttribute('data-folded', folded.length > 0 && folded.length === regions.length)
    if (regions.length < 2 || folded.length === regions.length) {
      stack.append(...nodes)
      return stack
    }
    const header = this.#headerShare(stackHeight, regions.length)
    const open = regions.filter(region => !folded.includes(region))
    const room = 100 - folded.length * header
    const shares = this.resolvedLayout.sizes.panels ?? {}
    const even = 100 / regions.length
    const min = stackMinSize(regions.length)
    const openSizes = normalizeShares(open.map(region => shares[region.name] ?? even), min).map(size => size * room / 100)
    const panels: FramePanel[] = regions.map((region, index) => {
      const fixed = folded.includes(region)
      return fixed
        ? { node: nodes[index]!, id: region.name, size: header, min: header, fixed: true }
        : { node: nodes[index]!, id: region.name, size: openSizes[open.indexOf(region)]!, min: Math.min(min, openSizes[open.indexOf(region)]!) }
    })
    stack.append(this.#splitter('vertical', panels, regions.slice(0, -1).map(region => region.name), (next) => {
      const recorded: Record<string, number> = {}
      regions.forEach((region, index) => {
        if (!folded.includes(region) && room > 0)
          recorded[region.name] = next[index]! / room * 100
      })
      this.#state = withDesignerPanelShares(this.resolvedLayout, recorded)
    }))
    return stack
  }

  /**
   * 两块以上面板的 <xh-splitter>：sizes 与 panels 按面板顺序，triggers 为每条分隔条名称里的区名，record 记下拖动中的大小，
   * 松手时派发 layout-change。collapsible 的面板在分隔条上双击或按 Enter 收起与展开；collapsed 的面板建出来就收着，
   * 这个分隔条不知道它收起前的大小，在它两侧双击或按 Enter 时由外框按记下的大小放回。fixed 的面板大小钉死。
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
      'default-sizes': panels.map(panel => round(panel.size)).join(','),
      'panels': JSON.stringify(panels.map(panel => ({
        id: panel.id,
        min: round(panel.min),
        ...(panel.fixed ? { max: round(panel.size) } : {}),
        ...(panel.collapsible ? { collapsible: true } : {}),
      }))),
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
      const side = [panels[index], panels[index + 1]].find(panel => panel?.collapsed === true && this.resolvedLayout.collapsed.includes(panel.id as DesignerLayoutDock))
      if (side === undefined)
        return
      event.preventDefault()
      event.stopPropagation()
      this.#expand(side.id as DesignerLayoutDock, { orientation, index })
    }
    splitter.addEventListener('dblclick', expandBuiltCollapsed, true)
    splitter.addEventListener('keydown', expandBuiltCollapsed, true)
    splitter.addEventListener('pointerdown', () => {
      this.#resizing = true
    }, true)
    splitter.addEventListener('sizes-change-end', (event) => {
      event.stopPropagation()
      if (event.target !== splitter)
        return
      this.#resizing = false
      if (!this.layoutPolicy?.locked)
        this.#flush('resize')
    })
    splitter.addEventListener('sizes-change', (event) => {
      event.stopPropagation()
      if (event.target !== splitter)
        return
      record((event as CustomEvent<{ sizes: number[] }>).detail.sizes)
      // 指针拖动中的大小等松手再派发；方向键调的、在分隔条上收起或放回的当场派发
      const collapsed = this.#state !== undefined && this.#emitted !== undefined && this.#state.collapsed.join() !== this.#emitted.collapsed.join()
      if ((!this.#resizing || collapsed) && !this.layoutPolicy?.locked)
        this.#flush('resize')
    })
    return splitter
  }

  #build(parts: Parts, plan: Plan): void {
    this.#splitters = []
    for (const position of ['header', 'top', 'center', 'status'] as const) {
      for (const region of plan[position])
        this.#regions.get(region.name)!.element.setAttribute('data-position', position)
    }
    for (const dock of DESIGNER_LAYOUT_DOCKS) {
      for (const region of plan.docks[dock])
        this.#regions.get(region.name)!.element.setAttribute('data-position', dock)
    }
    parts.header.replaceChildren(...plan.header.map(region => this.#regions.get(region.name)!.element))
    parts.header.hidden = plan.header.length === 0
    parts.top.replaceChildren(...plan.top.map(region => this.#regions.get(region.name)!.element))
    parts.top.hidden = plan.top.length === 0
    parts.status.replaceChildren(...plan.status.map(region => this.#regions.get(region.name)!.element))
    parts.status.hidden = plan.status.length === 0
    // 不显示的顶栏、状态栏区仍要在文档里，作者内容搬进它的段里才看得到有没有内容
    const parked = [...this.#regionList()].filter(region => ZONES[region.position] !== undefined && !plan[region.position as 'header' | 'status'].includes(region))
    for (const region of parked) {
      const element = this.#regions.get(region.name)!.element
      element.hidden = true
      parts.status.append(element)
    }
    for (const region of [...plan.header, ...plan.status])
      this.#regions.get(region.name)!.element.hidden = false
    this.#placeOverlays(parts, plan)

    const height = this.#bodyHeight
    let main: HTMLElement = this.#stack(plan.center, 'center', height)
    const bottomRegions = plan.docks.bottom
    if (bottomRegions.length > 0) {
      const collapsed = this.resolvedLayout.collapsed.includes('bottom')
      const minimized = new Set(this.resolvedLayout.minimized)
      const folded = bottomRegions.every(region => minimized.has(region.name) && region.title !== undefined)
      const foldedSize = folded && height > 0 && this.#foldedHeight > 0 ? Math.min(this.#foldedHeight * bottomRegions.length / height * 100, 100 - CENTER_MIN_SIZE) : 0
      const bottom = collapsed ? 0 : folded && foldedSize > 0 ? foldedSize : this.#sizeOf('bottom', bottomRegions, 100 - CENTER_MIN_SIZE)
      main = this.#splitter('vertical', [
        { node: main, id: 'center', size: 100 - bottom, min: CENTER_MIN_SIZE },
        folded && foldedSize > 0
          ? { node: this.#stack(bottomRegions, 'bottom', height * bottom / 100), id: 'bottom', size: bottom, min: bottom, fixed: true }
          : { node: this.#stack(bottomRegions, 'bottom', height * bottom / 100), id: 'bottom', size: bottom, min: this.#minOf('bottom', bottomRegions), collapsible: true, collapsed },
      ], [bottomRegions[0]!.name], (next) => {
        if (!folded)
          this.#record('bottom', next[1]!, bottom)
      })
    }

    if (this.#narrow) {
      // 窄屏：中间一列占满整行，左右两栏收进抽屉
      const drawers: HTMLElement[] = []
      for (const position of ['start', 'end'] as const) {
        const regions = plan.docks[position]
        if (regions.length === 0) {
          this.#drawers[position]?.body.replaceChildren()
          continue
        }
        const drawer = this.#ensureDrawer(position)
        drawer.body.replaceChildren(this.#stack(regions, position, height))
        drawers.push(drawer.element)
      }
      parts.body.replaceChildren(createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'main' }, [main]), ...drawers)
      this.#syncFloats(plan)
      return
    }

    const row: FramePanel[] = []
    const triggers: string[] = []
    const startRegions = plan.docks.start
    const endRegions = plan.docks.end
    const startCollapsed = this.resolvedLayout.collapsed.includes('start')
    const endCollapsed = this.resolvedLayout.collapsed.includes('end')
    const start = startRegions.length > 0 && !startCollapsed ? this.#sizeOf('start', startRegions, 100 - CENTER_MIN_SIZE - (endRegions.length > 0 && !endCollapsed ? this.#minOf('end', endRegions) : 0)) : 0
    const end = endRegions.length > 0 && !endCollapsed ? this.#sizeOf('end', endRegions, 100 - CENTER_MIN_SIZE - start) : 0
    if (startRegions.length > 0) {
      row.push({ node: this.#stack(startRegions, 'start', height), id: 'start', size: start, min: this.#minOf('start', startRegions), collapsible: true, collapsed: startCollapsed })
      triggers.push(startRegions[0]!.name)
    }
    row.push({ node: createAuthoredElement(this.ownerDocument, 'div', { 'data-scope': SCOPE, 'data-part': 'main' }, [main]), id: 'center', size: 100 - start - end, min: CENTER_MIN_SIZE })
    if (endRegions.length > 0) {
      row.push({ node: this.#stack(endRegions, 'end', height), id: 'end', size: end, min: this.#minOf('end', endRegions), collapsible: true, collapsed: endCollapsed })
      triggers.push(endRegions[0]!.name)
    }
    parts.body.replaceChildren(row.length > 1
      ? this.#splitter('horizontal', row, triggers, (next) => {
          row.forEach((panel, index) => {
            if (panel.id === 'start' || panel.id === 'end')
              this.#record(panel.id, next[index]!, panel.size)
          })
        })
      : row[0]!.node)
    this.#syncFloats(plan)
  }

  /** 画布浮动件放进画布区的角上：作者在那个角上写的内容不动，隐藏的留在原处收起。 */
  #placeOverlays(parts: Parts, plan: Plan): void {
    const center = this.#regionList().find(region => region.position === 'center')
    const zones = center === undefined ? undefined : this.#regions.get(center.name)?.zones
    const shown = new Set(plan.overlays.map(region => region.name))
    for (const region of this.#regionList()) {
      if (region.position !== 'overlay')
        continue
      const element = this.#regions.get(region.name)!.element
      element.setAttribute('data-position', 'overlay')
      const zone = zones?.[region.anchor ?? 'bottom-end']
      const target = zone ?? parts.status
      if (element.parentElement !== target)
        target.append(element)
      element.hidden = !shown.has(region.name) || zone === undefined
    }
  }

  /** 浮出的面板：按此刻要浮着的面板建好或撤掉小窗，把卡片搬进小窗。 */
  #syncFloats(plan: Plan): void {
    const parts = this.#parts!
    const wanted = new Set(plan.floating.map(region => region.name))
    for (const [name, float] of [...this.#floats]) {
      if (!wanted.has(name)) {
        float.element.remove()
        this.#floats.delete(name)
      }
    }
    for (const region of plan.floating) {
      let float = this.#floats.get(region.name)
      if (!float) {
        float = this.#createFloat(region.name)
        this.#floats.set(region.name, float)
      }
      if (float.element.parentElement !== parts.floats)
        parts.floats.append(float.element)
      const element = this.#regions.get(region.name)!.element
      element.setAttribute('data-position', 'float')
      if (element.parentElement !== float.body)
        float.body.append(element)
    }
    this.#placeFloats()
  }

  /** 一个小窗：标题栏有图标、标题、拖动把手、停靠、收拢与关闭；八个改尺把手。 */
  #createFloat(name: string): FrameFloat {
    const doc = this.ownerDocument
    const icon = createAuthoredElement(doc, 'xh-icon', { 'data-scope': SCOPE, 'data-part': 'float-icon' }) as HTMLElement & { icon?: IconRecord }
    const title = createAuthoredElement(doc, 'span', { 'data-xh-part': 'title' })
    const drag = createAuthoredElement(doc, 'button', { 'data-xh-part': 'drag-trigger', 'type': 'button' }) as HTMLButtonElement
    const dock = createAuthoredElement(doc, 'button', { 'type': 'button', 'data-scope': SCOPE, 'data-part': 'float-dock' }) as HTMLButtonElement
    dock.addEventListener('click', () => this.dockPanel(name))
    const minimize = createAuthoredElement(doc, 'button', { 'data-xh-part': 'window-state-trigger', 'window-state': 'minimized', 'type': 'button' }) as HTMLButtonElement
    const restore = createAuthoredElement(doc, 'button', { 'data-xh-part': 'window-state-trigger', 'window-state': 'default', 'type': 'button' }) as HTMLButtonElement
    const close = createAuthoredElement(doc, 'button', { 'data-xh-part': 'close-trigger', 'type': 'button' }) as HTMLButtonElement
    const header = createAuthoredElement(doc, 'div', { 'data-xh-part': 'header' }, [icon, title, drag, dock, minimize, restore, close])
    const body = createAuthoredElement(doc, 'div', { 'data-xh-part': 'body' })
    const content = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [
      header,
      body,
      ...RESIZE_EDGES.map(edge => createAuthoredElement(doc, 'div', { 'data-xh-part': 'resize-trigger', edge })),
    ])
    const element = createAuthoredElement(doc, 'xh-floating-panel', {
      'data-scope': SCOPE,
      'data-part': 'float',
      'data-region': name,
      'min-size': '200,120',
    }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [content]),
      ]),
    ]) as XhFloatingPanelElement
    element.open = true
    const stop = (event: Event): boolean => {
      if (event.target !== element)
        return false
      event.stopPropagation()
      return true
    }
    element.addEventListener('position-change', (event) => {
      if (!stop(event))
        return
      const { position } = (event as CustomEvent<{ position: { x: number, y: number } }>).detail
      const box = this.getBoundingClientRect()
      const current = this.resolvedLayout.floating[name]
      if (!current)
        return
      this.#moveFloat(name, { ...current, x: position.x - box.left, y: position.y - box.top })
    })
    element.addEventListener('dimensions-change', (event) => {
      if (!stop(event))
        return
      const { dimensions } = (event as CustomEvent<{ dimensions: { width: number, height: number } }>).detail
      const current = this.resolvedLayout.floating[name]
      if (!current)
        return
      this.#moveFloat(name, { ...current, width: dimensions.width, height: dimensions.height })
    })
    element.addEventListener('window-state-change', (event) => {
      if (!stop(event))
        return
      const { windowState } = (event as CustomEvent<{ windowState: string }>).detail
      this.#commit(withDesignerPanelMinimized(this.resolvedLayout, name, windowState === 'minimized'), 'minimize')
    })
    element.addEventListener('open-change', (event) => {
      if (!stop(event))
        return
      if (!(event as CustomEvent<{ open: boolean }>).detail.open)
        this.setPanelVisible(name, false)
    })
    return { element, title, icon, body, dock, minimize, restore, close, drag }
  }

  /** 小窗挪了或改了尺：夹在外框里，记进布局，停一会儿再派发。 */
  #moveFloat(name: string, rect: DesignerLayoutRect): void {
    const clamped = this.#clampFloat(rect)
    this.#state = withDesignerPanelFloating(this.resolvedLayout, name, clamped)
    this.#placeFloats()
    if (this.#floatTimer !== undefined)
      clearTimeout(this.#floatTimer)
    this.#floatTimer = setTimeout(() => {
      this.#floatTimer = undefined
      if (!this.layoutPolicy?.locked)
        this.#flush('float')
    }, FLOAT_SETTLE)
  }

  /** 小窗按布局落位：相对外框的坐标换成视口坐标。 */
  #placeFloats(): void {
    if (this.#floats.size === 0)
      return
    const box = this.getBoundingClientRect()
    const layout = this.resolvedLayout
    for (const [name, float] of this.#floats) {
      const rect = layout.floating[name]
      if (!rect)
        continue
      const position = { x: Math.round(box.left + rect.x), y: Math.round(box.top + rect.y) }
      const dimensions = { width: Math.round(rect.width), height: Math.round(rect.height) }
      if (float.element.position?.x !== position.x || float.element.position?.y !== position.y)
        float.element.position = position
      if (float.element.dimensions?.width !== dimensions.width || float.element.dimensions?.height !== dimensions.height)
        float.element.dimensions = dimensions
    }
  }

  /** 小窗的文案、图标与形态随布局刷新。 */
  #paintFloats(plan: Plan, t: DesignerFrameTranslations): void {
    const layout = this.resolvedLayout
    for (const region of plan.floating) {
      const float = this.#floats.get(region.name)
      if (!float)
        continue
      const title = region.title ?? region.name
      setText(float.title, title)
      float.icon.icon = region.icon
      float.icon.hidden = region.icon === undefined
      const abilities = designerPanelAbilities(region, this.layoutPolicy)
      const minimized = layout.minimized.includes(region.name)
      float.element.windowState = minimized ? 'minimized' : 'default'
      float.minimize.hidden = minimized || !abilities.minimizable
      float.restore.hidden = !minimized
      float.close.hidden = !abilities.closable
      float.dock.hidden = !abilities.floatable
      setAttributes(float.dock, { 'aria-label': t.dockPanel(title) })
      setAttributes(float.minimize, { 'aria-label': t.minimizePanel(title) })
      setAttributes(float.restore, { 'aria-label': t.expandPanel(title) })
      setAttributes(float.close, { 'aria-label': t.closePanel(title) })
    }
  }

  /** 小窗夹在外框里：大小不超过外框，整块都在框内。外框量不出大小时原样返回。 */
  #clampFloat(rect: DesignerLayoutRect): DesignerLayoutRect {
    const box = this.getBoundingClientRect()
    if (box.width <= 0 || box.height <= 0)
      return rect
    const width = Math.min(rect.width, box.width)
    const height = Math.min(rect.height, box.height)
    return { x: Math.round(clamp(rect.x, 0, box.width - width)), y: Math.round(clamp(rect.y, 0, box.height - height)), width: Math.round(width), height: Math.round(height) }
  }

  /** 浮出时缺省的小窗：卡片此刻的大小（不超过外框八成），放在中间一行的中央。 */
  #defaultFloatRect(name: string): DesignerLayoutRect {
    const box = this.getBoundingClientRect()
    const card = this.#regions.get(name)?.element.getBoundingClientRect()
    const width = Math.min(card && card.width > 0 ? card.width : FLOAT_WIDTH, box.width > 0 ? box.width * 0.8 : FLOAT_WIDTH)
    const height = Math.min(card && card.height > 0 ? card.height : FLOAT_HEIGHT, box.height > 0 ? box.height * 0.8 : FLOAT_HEIGHT)
    const body = this.#parts?.body.getBoundingClientRect()
    const x = body && body.width > 0 ? body.left - box.left + (body.width - width) / 2 : 0
    const y = body && body.height > 0 ? body.top - box.top + (body.height - height) / 2 : 0
    return { x, y, width, height }
  }

  /** 按住面板头开始拖：过了激活距离才算拖，松在停靠处换栏或调序，松在画布上浮出。 */
  #startPanelDrag(event: PointerEvent, name: string, card: HTMLElement, header: HTMLElement): void {
    if (event.button !== 0 || this.#narrow || this.#fromControl(event.target, header))
      return
    const abilities = this.#abilities(name)
    if (!abilities || !(abilities.movable || abilities.floatable) || Object.hasOwn(this.resolvedLayout.floating, name))
      return
    const box = card.getBoundingClientRect()
    const preview = header.cloneNode(true) as HTMLElement
    preview.style.inlineSize = `${Math.round(header.getBoundingClientRect().width)}px`
    startDrag<PanelDragPayload>(event, {
      payload: { kind: 'designer-panel', frame: this, id: name, grab: { x: event.clientX - box.left, y: event.clientY - box.top }, size: { width: box.width, height: box.height } },
      source: header,
      preview,
      onEnd: () => this.#dragLeave(),
    })
  }

  #isOwnPanelDrag(payload: unknown): payload is PanelDragPayload {
    return typeof payload === 'object' && payload !== null && (payload as PanelDragPayload).kind === 'designer-panel' && (payload as PanelDragPayload).frame === this
  }

  /** 拖面板时指针下的落点：靠外框左右与下边的停靠条、某一栏里两块面板之间，或画布上（浮出）。 */
  #dropAt(point: { x: number, y: number }, payload: PanelDragPayload): PanelDrop | undefined {
    const parts = this.#parts!
    const abilities = this.#abilities(payload.id)
    if (!abilities)
      return undefined
    const body = parts.body.getBoundingClientRect()
    const layout = this.resolvedLayout
    const plan = this.#plan()
    const append = (dock: DesignerLayoutDock): number => layout.docks[dock].filter(id => id !== payload.id).length
    if (abilities.movable && within(body, point.x, point.y)) {
      // 停靠条的位置与粗细由样式定（逻辑属性，从右往左写时左右自动对调），这里只量它
      const edgeOf = (dock: DesignerLayoutDock): DOMRect => parts.drop.querySelector<HTMLElement>(`[data-part="drop-edge"][data-dock="${dock}"]`)!.getBoundingClientRect()
      const strip = (dock: DesignerLayoutDock, edge: DOMRect): PanelDrop => ({ kind: 'dock', dock, index: append(dock), edge: true, line: { left: edge.left, top: edge.top, width: edge.width, height: edge.height } })
      for (const dock of ['start', 'end'] as const) {
        const edge = edgeOf(dock)
        if (edge.width > 0 && within(edge, point.x, point.y))
          return strip(dock, edge)
      }
      for (const dock of DESIGNER_LAYOUT_DOCKS) {
        const regions = plan.docks[dock]
        if (regions.length === 0)
          continue
        const stack = this.#regions.get(regions[0]!.name)!.element.closest('[data-part="stack"]')
        const rect = stack?.getBoundingClientRect()
        if (!rect || !within(rect, point.x, point.y))
          continue
        const rest = layout.docks[dock].filter(id => id !== payload.id)
        const visible = regions.filter(region => region.name !== payload.id)
        let index = rest.length
        let lineTop = rect.bottom
        for (const region of visible) {
          const box = this.#regions.get(region.name)!.element.getBoundingClientRect()
          if (point.y < box.top + box.height / 2) {
            index = rest.indexOf(region.name)
            lineTop = box.top
            break
          }
        }
        return { kind: 'dock', dock, index, edge: false, line: { left: rect.left, top: lineTop, width: rect.width, height: 0 } }
      }
      const bottom = edgeOf('bottom')
      if (bottom.height > 0 && within(bottom, point.x, point.y))
        return strip('bottom', bottom)
    }
    if (abilities.floatable && within(body, point.x, point.y)) {
      const box = this.getBoundingClientRect()
      const rect = this.#clampFloat({ x: point.x - box.left - payload.grab.x, y: point.y - box.top - payload.grab.y, width: payload.size.width, height: payload.size.height })
      return { kind: 'float', rect }
    }
    return undefined
  }

  /** 这个落点会不会改布局：停回原处不算。 */
  #changes(drop: PanelDrop, id: string): boolean {
    if (drop.kind === 'float')
      return true
    const layout = this.resolvedLayout
    const current = designerPanelDock(layout, id)
    if (current !== drop.dock)
      return true
    const rest = layout.docks[current].filter(item => item !== id)
    const next = [...rest.slice(0, drop.index), id, ...rest.slice(drop.index)]
    return next.join('\n') !== layout.docks[current].join('\n')
  }

  #dragOver(point: { x: number, y: number }, payload: unknown): { accept: boolean } {
    if (!this.#isOwnPanelDrag(payload))
      return { accept: false }
    const parts = this.#parts!
    const body = parts.body.getBoundingClientRect()
    const box = this.getBoundingClientRect()
    setAttributes(parts.drop, { style: `inset-block-start: ${Math.round(body.top - box.top)}px; block-size: ${Math.round(body.height)}px` })
    this.toggleAttribute('data-panel-drag', true)
    const drop = this.#dropAt(point, payload)
    const changes = drop !== undefined && this.#changes(drop, payload.id)
    this.#drop = changes ? drop : undefined
    for (const edge of parts.drop.querySelectorAll<HTMLElement>('[data-part="drop-edge"]'))
      edge.toggleAttribute('data-active', changes && drop.kind === 'dock' && drop.edge && edge.getAttribute('data-dock') === drop.dock)
    if (changes && !(drop.kind === 'dock' && drop.edge)) {
      const rect = drop.kind === 'dock' ? drop.line : { left: box.left + drop.rect.x, top: box.top + drop.rect.y, width: drop.rect.width, height: drop.rect.height }
      setAttributes(parts.dropLine, {
        'data-kind': drop.kind,
        'style': `left: ${Math.round(rect.left - box.left)}px; top: ${Math.round(rect.top - body.top)}px; width: ${Math.round(rect.width)}px; height: ${Math.round(rect.height)}px`,
      })
      parts.dropLine.hidden = false
    }
    else {
      parts.dropLine.hidden = true
    }
    return { accept: changes }
  }

  #dragDrop(_point: { x: number, y: number }, payload: unknown): void {
    const drop = this.#drop
    this.#dragLeave()
    if (!this.#isOwnPanelDrag(payload) || drop === undefined)
      return
    if (drop.kind === 'float')
      this.floatPanel(payload.id, drop.rect)
    else
      this.movePanel(payload.id, drop.dock, drop.index)
  }

  #dragLeave(): void {
    this.#drop = undefined
    this.toggleAttribute('data-panel-drag', false)
    const parts = this.#parts
    if (parts)
      parts.dropLine.hidden = true
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-frame': XhDesignerFrameElement
  }
}
