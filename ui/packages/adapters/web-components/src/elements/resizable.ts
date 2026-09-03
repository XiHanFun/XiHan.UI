import type { ResizableSchema, ResizableSize, ResizableSizeChangeDetails, ResizableSizeChangeEndDetails } from '@xihan-ui/headless'
import type { Direction, IdGenerator } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ResizeEdge } from '@xihan-ui/pointer'
import { connectResizable, resizableAnatomy, resizableMachine, resizableMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
/** 尺寸写成 `宽x高`（如 `320x200`）。解析不出两个有限数就当没写。 */
const SIZE_CONVERTER = {
  fromAttribute: (v: string | null): ResizableSize | undefined => {
    if (v == null || v.trim() === '')
      return undefined
    const [w, h] = v.split(/[x,\s]+/).map(Number)
    return Number.isFinite(w) && Number.isFinite(h) ? { width: w as number, height: h as number } : undefined
  },
}
/** 开放的边写成逗号分隔（如 `e,s,se`）。 */
const EDGES_CONVERTER = {
  fromAttribute: (v: string | null): ResizeEdge[] | undefined => {
    if (v == null || v.trim() === '')
      return undefined
    const out = v.split(',').map(s => s.trim()).filter(Boolean) as ResizeEdge[]
    return out.length ? out : undefined
  },
}

/**
 * `<xh-resizable>` —— Light-DOM 行为宿主：作者写 root 与八向 handle 角色节点，
 * 元素跑 resizable 机器并把 connect 产出打上去。
 *
 * 每个 handle 用 `edge` 属性写明自己是哪条边（`n` / `ne` / `e` / `se` / `s` / `sw` / `w` / `nw`），
 * 与 Vue 侧的 `:edge` 是同一份声明。
 *
 * 尺寸由元素每帧写进 root 的内联 `inline-size` / `block-size`，作者的样式表不要再碰这两条轴。
 * **推西边与北边时容器的起点会动**，那段位移写成 root 的 `left` / `top`——皮肤已给
 * `position: relative`，开箱即对；把 root 改成 `static` 会让这两个方向只变尺寸不移位。
 *
 * 键盘全在把手上：方向键按屏幕方向推一步（推东边时右键变宽、推西边时右键变窄，与拖动同义），
 * 按住 Shift 走大步，Home / End 推到这条边能到的两端。
 *
 * @customElement xh-resizable
 * @attr {string} size - 受控尺寸，写成 `宽x高`（如 `320x200`）；缺省该属性即非受控
 * @attr {string} default-size - 非受控初值，同样写成 `宽x高`
 * @attr {number} min-width - 宽度下限
 * @attr {number} min-height - 高度下限
 * @attr {number} max-width - 宽度上限；不给即不封顶
 * @attr {number} max-height - 高度上限；不给即不封顶
 * @attr {number} aspect-ratio - 宽高比（宽 ÷ 高）。给了就锁死，四个角以宽为准
 * @attr {number} step - 吸附步进：宽高各自落到最近的整数倍
 * @attr {number} keyboard-step - 方向键一次推多远（px），默认 8
 * @attr {number} keyboard-large-step - 按住 Shift 时的步长（px），默认 40
 * @attr {string} edges - 开放哪几条边，逗号分隔（如 `e,s,se`）；默认八向全开
 * @attr {boolean} disabled - 禁用：把手退出 Tab 序列，按下也不进调整
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调水平位移与左右两键的正负，默认 ltr
 * @fires size-change - 尺寸变化（拖动途中会连发）；detail 为 `{ size }`
 * @fires size-change-end - 一次调整收尾发一次；detail 为 `{ size, edge }`
 * @csspart root - 承载 data-resizing / data-edge / data-disabled 的容器，尺寸写在它的内联样式上
 * @csspart handle - role=separator 的把手，指针与键盘交互全在它身上
 */
export class XhResizableElement extends XhElement {
  static override partContract = { anatomy: resizableAnatomy, meta: resizableMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    size: { converter: SIZE_CONVERTER },
    defaultSize: { converter: SIZE_CONVERTER, attribute: 'default-size' },
    minWidth: { converter: NUMBER_CONVERTER, attribute: 'min-width' },
    minHeight: { converter: NUMBER_CONVERTER, attribute: 'min-height' },
    maxWidth: { converter: NUMBER_CONVERTER, attribute: 'max-width' },
    maxHeight: { converter: NUMBER_CONVERTER, attribute: 'max-height' },
    aspectRatio: { converter: NUMBER_CONVERTER, attribute: 'aspect-ratio' },
    step: { converter: NUMBER_CONVERTER },
    keyboardStep: { converter: NUMBER_CONVERTER, attribute: 'keyboard-step' },
    keyboardLargeStep: { converter: NUMBER_CONVERTER, attribute: 'keyboard-large-step' },
    edges: { converter: EDGES_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 对象进不了属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare size?: ResizableSize
  declare defaultSize?: ResizableSize
  declare minWidth?: number
  declare minHeight?: number
  declare maxWidth?: number
  declare maxHeight?: number
  declare aspectRatio?: number
  declare step?: number
  declare keyboardStep?: number
  declare keyboardLargeStep?: number
  declare edges?: ResizeEdge[]
  declare disabled?: boolean
  declare direction?: Direction
  /** 可调区域与各条边把手的无障碍名。 */
  declare translations?: ResizableSchema['props']['translations']

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly resizableScope = createScope(null, this.idGen)

  private readonly notifySize = (details: ResizableSizeChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('size-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySizeEnd = (details: ResizableSizeChangeEndDetails): void => {
    this.dispatchEvent(new CustomEvent('size-change-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ResizableSchema>(
    this,
    resizableMachine,
    () => this.machineProps(),
    { scope: this.resizableScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ResizableSchema['props']> {
    return {
      size: this.size,
      defaultSize: this.defaultSize,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight,
      aspectRatio: this.aspectRatio,
      step: this.step,
      keyboardStep: this.keyboardStep,
      keyboardLargeStep: this.keyboardLargeStep,
      edges: this.edges,
      disabled: this.disabled ?? false,
      dir: this.direction,
      translations: this.translations,
      onSizeChange: this.notifySize,
      onSizeChangeEnd: this.notifySizeEnd,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 容器懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<ResizableSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /** 把手自报的边。没写就落东南角——那是文档流里最常见的那个。 */
  private edgeOf(el: HTMLElement): ResizeEdge {
    return (el.getAttribute('edge') as ResizeEdge | null) ?? 'se'
  }

  protected wire(): void {
    const api = connectResizable(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    for (const el of this.getParts('handle'))
      this.spreader.spread(el, api.getHandleProps({ edge: this.edgeOf(el) }) as Record<string, unknown>)
  }
}
