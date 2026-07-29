import type { Direction, IdGenerator, Orientation } from '@xihan-ui/core'
import type { SplitterPanelProps, SplitterSchema, SplitterSizeChangeDetails, SplitterSizeChangeEndDetails } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectSplitter, splitterMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
// （size 尤其：落成 null 就分不出"非受控"与"受控且当前为空"）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
/**
 * 布局是百分比数组，属性写成逗号分隔（两栏 size="30,70"）。
 * 解析不出任何有限数就当没写：留下 NaN 会一路写进 aria-valuenow 与定位百分比。
 */
const NUMBER_LIST_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v == null || v.trim() === '')
      return undefined
    const out = v.split(',').map(Number).filter(Number.isFinite)
    return out.length ? out : undefined
  },
}
/**
 * 面板约束写成 JSON 数组（`panels='[{"id":"main","min":20}]'`）。
 * 解析不出数组就当没写——落一个半截对象进去会让面板块数与作者写的节点数对不上，
 * 那时错的是布局而不只是某一条约束，回到"全都不设限"反而更接近作者本意。
 */
const PANELS_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v == null || v.trim() === '')
      return undefined
    try {
      const parsed: unknown = JSON.parse(v)
      return Array.isArray(parsed) ? (parsed as SplitterPanelProps[]) : undefined
    }
    catch {
      return undefined
    }
  },
}

/**
 * `<xh-splitter>` —— Light-DOM 行为宿主：作者写 root/panel/resize-trigger 角色节点，
 * 元素跑 splitter 机器并把 connect 产出打上去。
 *
 * 面板尺寸是百分比，总和恒为 100；每块的尺寸由元素每帧写进内联样式（flex-basis），
 * 作者的样式表不要再碰这条轴。
 *
 * 拖拽挂在分隔条上（按下—跟手—松手），像素与百分比的换算取 root 的矩形——
 * 矩形在拖拽开始那一刻才量，连接期一律不碰 DOM。
 * 键盘全在分隔条上：方向键按 step 推、Shift+方向键按 largeStep 推、
 * Home/End 取该面板眼下能到的两端、Enter 折叠或展开可折叠的面板。
 *
 * 面板与分隔条都要用 index 属性写明自己是第几个（`index="1"`）；
 * 第 index 条分隔条坐在第 index 与第 index+1 块面板之间，调整的是前一块。
 *
 * @customElement xh-splitter
 * @attr {string} size - 受控布局，逗号分隔的百分比（如 "30,70"）；缺省该属性即非受控
 * @attr {string} default-size - 非受控初值，同样逗号分隔；缺省时按面板数等分
 * @attr {string} panels - 逐块约束的 JSON 数组：id / min / max / collapsible / collapsedSize
 * @attr {'horizontal'|'vertical'} orientation - 面板排布轴，默认 horizontal（并排）
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调水平排布下左右两键与指针位移的正负，默认 ltr
 * @attr {boolean} disabled - 禁用：分隔条退出 Tab 序列、拖不动也推不动
 * @attr {number} step - 方向键的步长（百分比），默认 1
 * @attr {number} large-step - Shift + 方向键的步长（百分比），默认 10
 * @fires size-change - 布局变化（拖动途中会连发）；detail 为 `{ size: number[] }`
 * @fires size-change-end - 一次拖拽收尾发一次；detail 为 `{ size: number[], index: number }`
 * @csspart root - 承载 data-orientation / data-disabled / data-dragging 的容器，矩形以它为准
 * @csspart panel - 一块面板；尺寸由内联 flex-basis 给出，折叠时带 data-collapsed
 * @csspart resize-trigger - role=separator 的分隔条，指针与键盘交互全在它身上
 */
export class XhSplitterElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    size: { converter: NUMBER_LIST_CONVERTER },
    defaultSize: { converter: NUMBER_LIST_CONVERTER, attribute: 'default-size' },
    panels: { converter: PANELS_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { converter: BOOLEAN_CONVERTER },
    step: { converter: NUMBER_CONVERTER },
    largeStep: { converter: NUMBER_CONVERTER, attribute: 'large-step' },
  }

  declare size?: number[]
  declare defaultSize?: number[]
  declare panels?: SplitterPanelProps[]
  declare orientation?: Orientation
  declare direction?: Direction
  declare disabled?: boolean
  declare step?: number
  declare largeStep?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly splitterScope = createScope(null, this.idGen)

  private readonly notifySize = (details: SplitterSizeChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('size-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySizeEnd = (details: SplitterSizeChangeEndDetails): void => {
    this.dispatchEvent(new CustomEvent('size-change-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SplitterSchema>(
    this,
    splitterMachine,
    () => this.machineProps(),
    { scope: this.splitterScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SplitterSchema['props']> {
    return {
      size: this.size,
      defaultSize: this.defaultSize,
      panels: this.panels,
      orientation: this.orientation,
      dir: this.direction,
      disabled: this.disabled ?? false,
      step: this.step,
      largeStep: this.largeStep,
      onSizeChange: this.notifySize,
      onSizeChangeEnd: this.notifySizeEnd,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 容器懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<SplitterSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /**
   * 部件自报的下标。作者在节点上写 index="1"，与 Vue 侧的 `:index` 是同一份声明；
   * 写不出数字（没写、写错）时退回 0。
   */
  private partIndex(el: HTMLElement): number {
    const raw = Number(el.getAttribute('index'))
    return Number.isFinite(raw) ? raw : 0
  }

  protected wire(): void {
    const api = connectSplitter(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    for (const el of this.getParts('panel'))
      this.spreader.spread(el, api.getPanelProps(this.partIndex(el)) as Record<string, unknown>)

    for (const el of this.getParts('resize-trigger'))
      this.spreader.spread(el, api.getResizeTriggerProps(this.partIndex(el)) as Record<string, unknown>)
  }
}
