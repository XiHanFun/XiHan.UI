import type {
  FloatingPanelOpenChangeDetails,
  FloatingPanelPosition,
  FloatingPanelPositionChangeDetails,
  FloatingPanelResizeEdge,
  FloatingPanelSchema,
  FloatingPanelSize,
  FloatingPanelSizeChangeDetails,
  FloatingPanelStage,
  FloatingPanelStageChangeDetails,
} from '@xihan-ui/headless'
import type { IdGenerator } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectFloatingPanel, floatingPanelAnatomy, floatingPanelMachine, floatingPanelMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值的唯一事实源留在机器与 connect。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席 = undefined（用默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 draggable / resizable 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 一对数写成逗号分隔（position="24,24"）；读不出两个有限数就当没写。 */
function parsePair(v: string | null): [number, number] | undefined {
  if (v == null || v.trim() === '')
    return undefined
  const parts = v.split(',').map(Number)
  return parts.length === 2 && parts.every(Number.isFinite) ? [parts[0]!, parts[1]!] : undefined
}

const POSITION_CONVERTER = {
  fromAttribute: (v: string | null): FloatingPanelPosition | undefined => {
    const pair = parsePair(v)
    return pair ? { x: pair[0], y: pair[1] } : undefined
  },
}

const SIZE_CONVERTER = {
  fromAttribute: (v: string | null): FloatingPanelSize | undefined => {
    const pair = parsePair(v)
    return pair ? { width: pair[0], height: pair[1] } : undefined
  },
}

const EDGES: readonly FloatingPanelResizeEdge[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const STAGES: readonly FloatingPanelStage[] = ['default', 'minimized', 'maximized']

/**
 * `<xh-floating-panel>` —— Light-DOM 行为宿主：作者写 root / positioner / content 等角色节点，
 * 元素跑 floating-panel 机器并把 connect 产出打上去。
 *
 * 面板的落位与尺寸由元素每帧写进 positioner 的内联样式（position/left/top/width/height），
 * 作者的样式表不要再碰这五个属性。收起态用内联 display 收住 positioner，正文收拢时同样收住。
 *
 * 改尺把手要在节点上写明守哪条边（`edge="se"`），形态按钮要写明切到哪个形态（`stage="minimized"`），
 * 与 Vue 侧的 `:edge` / `:stage` 是同一份声明。
 *
 * 位置与尺寸的属性形式是逗号分隔的一对数（`default-position="24,24"`、`default-size="360,240"`）；
 * 也可以直接喂 property（`el.position = { x: 24, y: 24 }`）。
 *
 * @customElement xh-floating-panel
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} position - 受控落点，写成 "x,y"（px，相对视口）
 * @attr {string} default-position - 非受控初始落点，默认 "24,24"
 * @attr {string} size - 受控尺寸，写成 "宽,高"（px）
 * @attr {string} default-size - 非受控初始尺寸，默认 "360,240"
 * @attr {string} min-size - 尺寸下限，默认 "160,120"
 * @attr {string} max-size - 尺寸上限，不写即不封顶
 * @attr {'default'|'minimized'|'maximized'} stage - 受控形态
 * @attr {'default'|'minimized'|'maximized'} default-stage - 非受控初始形态，默认 default
 * @attr {boolean} panel-draggable - 允不允许搬动面板，默认开启；铺满形态下恒不可搬。不叫 draggable：那是 HTML 全局属性，写上去宿主会变成原生拖放源
 * @attr {boolean} resizable - 允不允许改尺寸，默认开启；只有常规形态下才改得动
 * @attr {boolean} disabled - 禁用：搬不动、改不了尺寸、切不了形态；开合与关闭不受影响
 * @fires open-change - 展开态变化；detail 为 `{ open: boolean }`
 * @fires position-change - 落点变化（拖动途中会连发）；detail 为 `{ position: { x, y } }`
 * @fires size-change - 尺寸变化（改尺途中会连发）；detail 为 `{ size: { width, height } }`
 * @fires stage-change - 形态变化；detail 为 `{ stage: 'default' | 'minimized' | 'maximized' }`
 * @csspart root - 面板与触发器共同的容器
 * @csspart trigger - 打开面板的按钮
 * @csspart positioner - 承载落位与尺寸的定位容器，收起时被内联 display 收住
 * @csspart content - role=dialog 的面板本体（Esc 收口所在）
 * @csspart header - 标题栏：标题、拖拽把手与几个按钮排在这里
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart drag-trigger - 拖拽把手，须是原生 `<button>`
 * @csspart resize-trigger - 改尺把手，自带 edge 属性；接线后是 `role="separator"`，别写成 `<button>`
 * @csspart stage-trigger - 形态按钮，须是原生 `<button>` 并自带 stage 属性
 * @csspart close-trigger - 关闭按钮
 * @csspart body - 正文，收拢时带 hidden
 */
export class XhFloatingPanelElement extends XhElement {
  static override partContract = { anatomy: floatingPanelAnatomy, meta: floatingPanelMeta }

  // 搬动开关叫 panelDraggable / panel-draggable，两侧都避开原生的 draggable：
  // 那是 HTML 全局枚举属性，写成 draggable="true" 会让宿主变成 HTML5 拖放源，
  // dragstart 一起浏览器随即派 pointercancel，指针拖动当场中止；
  // 同名的响应式字段还会与 HTMLElement.draggable 这个 boolean 访问器打架。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    position: { converter: POSITION_CONVERTER },
    defaultPosition: { converter: POSITION_CONVERTER, attribute: 'default-position' },
    size: { converter: SIZE_CONVERTER },
    defaultSize: { converter: SIZE_CONVERTER, attribute: 'default-size' },
    minSize: { converter: SIZE_CONVERTER, attribute: 'min-size' },
    maxSize: { converter: SIZE_CONVERTER, attribute: 'max-size' },
    stage: { converter: STRING_CONVERTER },
    defaultStage: { converter: STRING_CONVERTER, attribute: 'default-stage' },
    panelDraggable: { converter: BOOLEAN_CONVERTER, attribute: 'panel-draggable' },
    resizable: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare position?: FloatingPanelPosition
  declare defaultPosition?: FloatingPanelPosition
  declare size?: FloatingPanelSize
  declare defaultSize?: FloatingPanelSize
  declare minSize?: FloatingPanelSize
  declare maxSize?: FloatingPanelSize
  declare stage?: FloatingPanelStage
  declare defaultStage?: FloatingPanelStage
  declare panelDraggable?: boolean
  declare resizable?: boolean
  declare disabled?: boolean
  declare translations?: FloatingPanelSchema['props']['translations']

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly panelScope = createScope(null, this.idGen)

  private readonly notifyOpen = (details: FloatingPanelOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyPosition = (details: FloatingPanelPositionChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('position-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySize = (details: FloatingPanelSizeChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('size-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyStage = (details: FloatingPanelStageChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('stage-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<FloatingPanelSchema>(
    this,
    floatingPanelMachine,
    () => this.machineProps(),
    { scope: this.panelScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<FloatingPanelSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen,
      position: this.position,
      defaultPosition: this.defaultPosition,
      size: this.size,
      defaultSize: this.defaultSize,
      minSize: this.minSize,
      maxSize: this.maxSize,
      stage: this.stage,
      defaultStage: this.defaultStage,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回机器
      draggable: this.panelDraggable,
      resizable: this.resizable,
      disabled: this.disabled,
      translations: this.translations,
      onOpenChange: this.notifyOpen,
      onPositionChange: this.notifyPosition,
      onSizeChange: this.notifySize,
      onStageChange: this.notifyStage,
    }
  }

  // service 由参数传入，不走 this.ctrl：这条回调是机器建起来那一刻就调的，不依赖字段赋值顺序。
  // 面板节点懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<FloatingPanelSchema>): void {
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 把手自报守的是哪条边；没写或写错时按右下角处理，那是最常见的那一个。 */
  private edgeOf(el: HTMLElement): FloatingPanelResizeEdge {
    const raw = el.getAttribute('edge') as FloatingPanelResizeEdge | null
    return raw && EDGES.includes(raw) ? raw : 'se'
  }

  /** 形态按钮自报切到哪个形态；没写或写错时按常规处理。 */
  private stageOf(el: HTMLElement): FloatingPanelStage {
    const raw = el.getAttribute('stage') as FloatingPanelStage | null
    return raw && STAGES.includes(raw) ? raw : 'default'
  }

  protected wire(): void {
    const api = connectFloatingPanel(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('drag-trigger', api.getDragTriggerProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)
    put('body', api.getBodyProps() as Record<string, unknown>)

    // 把手与形态按钮是多实例 part，逐个打：身份取作者写在节点上的声明
    for (const el of this.getParts('resize-trigger'))
      this.spreader.spread(el, api.getResizeTriggerProps({ edge: this.edgeOf(el) }) as Record<string, unknown>)
    for (const el of this.getParts('stage-trigger'))
      this.spreader.spread(el, api.getStageTriggerProps({ stage: this.stageOf(el) }) as Record<string, unknown>)

    // 收起用内联 display，优先级高于样式表对 [hidden] 的覆盖：
    // 作者给这两个节点写了 display 时，光靠 hidden 属性压不住
    this.setPartHidden(this.getPart('positioner'), !api.open)
    this.setPartHidden(this.getPart('body'), api.stage === 'minimized')
  }
}
