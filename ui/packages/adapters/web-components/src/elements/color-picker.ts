import type {
  ColorPickerChannel,
  ColorPickerFormat,
  ColorPickerOpenChangeDetails,
  ColorPickerSchema,
  ColorPickerTranslations,
  ColorPickerValueChangeDetails,
} from '@xihan-ui/headless'
import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { colorPickerAnatomy, colorPickerMachine, colorPickerMeta, colorPickerToChannel, colorPickerToInputChannel, connectColorPicker } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
/** 预设色板写成逗号分隔（swatches="#ff0000,#00ff00"），空串当没写。 */
const STRING_LIST_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v == null || v.trim() === '')
      return undefined
    const out = v.split(',').map(item => item.trim()).filter(Boolean)
    return out.length ? out : undefined
  },
}

/**
 * `<xh-color-picker>` —— Light-DOM 行为宿主：作者写 root/label/trigger/value-text/swatch/
 * positioner/content/area/area-thumb/channel-slider/channel-input/swatch-item 等角色节点，
 * 元素跑 color-picker 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 trigger，被定位的浮层取 positioner。
 *
 * 工作色恒是 HSVA（取色区两轴为饱和度与明度），对外的值串按 format 序列化。
 * 取色区与通道滑杆的矩形只在指针事件那一刻才量。
 *
 * 通道滑杆与数值框用 channel 属性写明自己调哪一路（`channel="hue"` / `channel="r"`），
 * 滑杆内的轨道与拇指跟随所在滑杆的通道；预设色板每格用 value 属性写明颜色。
 *
 * @customElement xh-color-picker
 * @attr {string} value - 受控颜色值串；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值，默认 #000000
 * @attr {'hex'|'rgba'|'hsla'} format - 值串写法，默认 hex
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 禁用：触发器与按钮走原生 disabled，取色区与滑杆退出 Tab 序列
 * @attr {boolean} read-only - 只读：浮层照开，进去只是改不动
 * @attr {boolean} alpha - 带透明度，默认关；关掉时透明度那条滑杆与输入框整条禁用
 * @attr {string} swatches - 预设色板，逗号分隔（如 "#ff0000,#00ff00"）
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写横轴上左右两键与指针的语义，默认 ltr
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {string} name - 表单字段名；给了 hidden-input 才带 name 并参与提交
 * @fires value-change - 颜色变化；detail 为 `{ value: string }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly）
 * @csspart label - 组标题（触发器 aria-labelledby 的目标之一）
 * @csspart control - 触发按钮的收纳容器：描边、底色与聚焦环都落在这一层
 * @csspart trigger - 触发按钮，须是原生 button；同时是浮层的定位锚点
 * @csspart value-text - 当前值串的显示位；留空即由元素填入，作者写了内容则归作者
 * @csspart swatch - 当前颜色的色块（aria-hidden，背景由连接层写成内联样式）
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=dialog 容器（焦点域与消解层的根节点），收起时带 hidden
 * @csspart area - 二维取色区，横轴饱和度、纵轴明度；底色是当前色相
 * @csspart area-thumb - role=slider 的取色区拇指，两条轴的位置由连接层写成内联样式
 * @csspart channel-slider - 一条通道滑杆的外框，须自带 channel 属性（hue / alpha）
 * @csspart channel-slider-track - 通道轨道，值与坐标的换算以它的矩形为准
 * @csspart channel-slider-thumb - role=slider 的通道拇指
 * @csspart channel-input - 数值输入框，须是原生 input 且自带 channel 属性（hex / r / g / b / a）
 * @csspart eye-dropper-trigger - 屏幕取色按钮，须是原生 button；环境不支持时自动禁用
 * @csspart swatch-group - role=group 的预设色板容器
 * @csspart swatch-item - 预设色板一格，须是原生 button 且自带 value 属性
 * @csspart hidden-input - type=hidden 的表单出口，值是当前颜色串；作者不写这个部件就不参与提交
 */
export class XhColorPickerElement extends XhElement {
  static override partContract = { anatomy: colorPickerAnatomy, meta: colorPickerMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    format: { converter: STRING_CONVERTER },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    alpha: { converter: BOOLEAN_CONVERTER },
    swatches: { converter: STRING_LIST_CONVERTER },
    name: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    // 文案表是对象，只走 property
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare format?: ColorPickerFormat
  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare alpha?: boolean
  declare swatches?: string[]
  declare name?: string
  declare direction?: Direction
  declare placement?: Placement
  declare offset?: number
  declare translations?: Partial<ColorPickerTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly pickerScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notifyValue = (details: ColorPickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: ColorPickerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ColorPickerSchema>(
    this,
    colorPickerMachine,
    () => this.machineProps(),
    { scope: this.pickerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ColorPickerSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      format: this.format,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      alpha: this.alpha ?? false,
      swatches: this.swatches,
      name: this.name,
      dir: this.direction,
      placement: this.placement,
      offset: this.offset,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.pickerScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 触发器记为本层分支：点它算层内交互，开合交给它自己切换。
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  /** 某条通道的轨道：先按 channel 属性找到那条滑杆，再取它自己那条轨道。 */
  private channelTrack(channel: ColorPickerChannel): HTMLElement | null {
    const slider = this.getParts('channel-slider')
      .find(el => colorPickerToChannel(el.getAttribute('channel') ?? undefined) === channel)
    if (!slider)
      return null
    return this.getParts('channel-slider-track').find(el => slider.contains(el)) ?? null
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入；节点一律懒读，建机器时 partMap 还空着。
  private injectRefs(svc: Service<ColorPickerSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getAreaEl', () => this.getPart('area'))
    svc.refs.set('getChannelTrackEl', channel => this.channelTrack(channel))
  }

  /** 提前发现一次角色节点，让 default-open 时机器在 hostConnected 里就取得到 content。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()

  private fillValueText(el: HTMLElement, text: string): void {
    let owned = this.ownsValueText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsValueText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  // 滑杆内的子部件：getParts 收的是整个元素范围，按滑杆子树过滤才归得对通道。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectColorPicker(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('swatch', api.getSwatchProps() as Record<string, unknown>)
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('area', api.getAreaProps() as Record<string, unknown>)
    put('area-thumb', api.getAreaThumbProps() as Record<string, unknown>)
    put('eye-dropper-trigger', api.getEyeDropperTriggerProps() as Record<string, unknown>)
    put('swatch-group', api.getSwatchGroupProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 值串的显示由元素代填（作者只需给出空节点）；作者写了内容就归作者，元素不再改写
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(valueText, api.value)
    }

    // 通道滑杆是多实例 part，逐条打：身份取作者写的 channel 属性，漏写或写错都退回色相
    for (const el of this.getParts('channel-slider')) {
      const channel = colorPickerToChannel(el.getAttribute('channel') ?? undefined)
      this.spreader.spread(el, api.getChannelSliderProps({ channel }) as Record<string, unknown>)
      for (const track of this.partsIn(el, 'channel-slider-track'))
        this.spreader.spread(track, api.getChannelSliderTrackProps({ channel }) as Record<string, unknown>)
      for (const thumb of this.partsIn(el, 'channel-slider-thumb'))
        this.spreader.spread(thumb, api.getChannelSliderThumbProps({ channel }) as Record<string, unknown>)
    }

    // 数值框不必住在滑杆里（多半与滑杆各占一行），身份由它自己声明
    for (const el of this.getParts('channel-input')) {
      const channel = colorPickerToInputChannel(el.getAttribute('channel') ?? undefined)
      this.spreader.spread(el, api.getChannelInputProps({ channel }) as Record<string, unknown>)
    }

    for (const el of this.getParts('swatch-item'))
      this.spreader.spread(el, api.getSwatchItemProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    // Light DOM 常驻，WC 自管可见性：作者层若给 content 声明了 display，
    // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
    // 本包的样式自带 [hidden]{display:none} 压得住，但宿主不能指望作者装了这份样式
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(this.getPart('content'))
    this.exit.update(api.open)
    this.setPartHidden(this.getPart('content'), !this.exit.visible)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
