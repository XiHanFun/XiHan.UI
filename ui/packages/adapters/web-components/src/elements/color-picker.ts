/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type {
  ColorFormat,
  ColorPickerErrorDetails,
  ColorPickerErrors,
  ColorPickerOpenChangeDetails,
  ColorPickerSchema,
  ColorPickerServices,
  ColorPickerTranslations,
  ColorPickerValueChangeDetails,
  ColorSliderApi,
  ColorSliderSchema,
  ColorSwatchPickerItemProps,
  FormControlState,
  SliderSchema,
} from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import {
  colorPickerAlphaSliderProps,
  colorPickerAnatomy,
  colorPickerHueSliderProps,
  colorPickerMachine,
  colorPickerMeta,
  colorPickerSwatchPickerProps,
  colorPickerToInputChannel,
  colorSliderAnatomy,
  colorSliderMachine,
  colorSliderSliderProps,
  colorSwatchPickerAnatomy,
  colorSwatchPickerMachine,
  connectColorPicker,
  resolveFormControlState,
  sliderMachine,
} from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

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
 * `<xh-color-picker>`：Light-DOM 行为宿主：作者写 root / label / trigger / value-text / swatch /
 * positioner / content / saturation-area / area-thumb / hue-slider / alpha-slider / channel-input / swatch-picker
 * 等角色节点，元素运行 color-picker 状态机并把 connect 产出接上。浮层定位引擎在本元素中创建、经 refs 注入状态机，
 * 锚点取 trigger，被定位的浮层取 positioner。
 *
 * 工作色恒为 HSVA（取色区两轴为饱和度与明度），对外的值串按 format 序列化。
 * format 只在落值时起作用，单独修改它不重排已有的值串：需要当前颜色按新写法产出时，
 * 更换 format 后再调用一次 `setValue(当前值)`。取色区与滑块轨道的矩形只在指针事件时测量。
 *
 * 色相 / 透明度两条颜色滑块与预设色板是内嵌组件：hue-slider / alpha-slider / swatch-picker 三个挂载点
 * 同时充当它们的根节点，挂载点中作者编写的是 color-slider 的 control / track / thumb / label / value-text /
 * hidden-input 与 color-swatch-picker 的 item / swatch / indicator / hidden-input，接线后各带自己的
 * data-scope；色板的格子用 value 属性写明颜色。数值框用 channel 属性写明所调的通道（`channel="r"`）。
 *
 * @customElement xh-color-picker
 * @attr {string} value - 受控颜色值串；未提供该属性即非受控
 * @attr {string} default-value - 非受控初值，默认 #000000
 * @attr {'hex'|'rgba'|'hsla'} format - 值串写法，默认 hex
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 禁用：触发器与按钮使用原生 disabled，取色区与滑杆退出 Tab 序列
 * @attr {boolean} read-only - 只读：浮层照常打开，其中内容不可修改
 * @attr {boolean} alpha - 带透明度，默认关闭；关闭时透明度滑杆与输入框整条禁用
 * @attr {string} swatches - 预设色板，逗号分隔（如 "#ff0000,#00ff00"）
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写横轴上左右两键与指针的语义，默认 ltr
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {string} name - 表单字段名；提供后 hidden-input 才带 name 并参与提交
 * @fires value-change - 颜色变化；detail 为 `{ value: string }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires color-error - 格式、输入、颜色解析或屏幕取色失败；detail 为判别式错误对象
 * @csspart root - 组件根容器（承载 data-state / data-disabled / data-readonly）
 * @csspart label - 组标题（触发器 aria-labelledby 的目标之一）
 * @csspart control - 触发按钮的收纳容器：描边、底色与聚焦环都落在这一层
 * @csspart trigger - 触发按钮，须是原生 button；同时是浮层的定位锚点
 * @csspart value-text - 当前值串的显示位；留空即由元素填入，作者写了内容则由作者负责
 * @csspart swatch - 当前颜色的色块（aria-hidden，背景由连接层写为内联样式）
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - role=dialog 容器（焦点域与消解层的根节点），收起时带 hidden
 * @csspart saturation-area - 二维取色区，横轴饱和度、纵轴明度；底色是当前色相
 * @csspart area-thumb - role=slider 的取色区拇指，两条轴的位置由连接层写为内联样式
 * @csspart hue-slider - 色相滑块的挂载点，同时是该滑块的根节点；其中写 color-slider 的 control / track / thumb
 * @csspart alpha-slider - 透明度滑块的挂载点，同上；alpha 关闭时整条禁用
 * @csspart track - 颜色滑块的轨道（data-scope="color-slider"），写在 hue-slider / alpha-slider 挂载点中；渐变由元素写为内联 background-image
 * @csspart thumb - 颜色滑块 role=slider 的拇指（data-scope="color-slider"），位置由元素写为内联样式
 * @csspart channel-input - 数值输入框，须是原生 input 且自带 channel 属性（hex / r / g / b / a）
 * @csspart eye-dropper-trigger - 屏幕取色按钮，须是原生 button；环境不支持时自动禁用
 * @csspart swatch-picker - 预设色板的挂载点，同时是色板的根节点（role=radiogroup）；其中写 color-swatch-picker 的 item / swatch / indicator / hidden-input，每格自带 value 属性
 * @csspart item - 色板中 role=radio 的一格（data-scope="color-swatch-picker"），须自带 value 属性声明颜色串
 * @csspart indicator - 色板格子的选中标记（data-scope="color-swatch-picker"）
 * @csspart hidden-input - type=hidden 的表单出口，值是当前颜色串；作者未编写该部件时不参与提交
 */
export class XhColorPickerElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  // 两条颜色滑块与色板的 DOM 摊在本元素的 Light DOM 里由本元素接线，它们的角色节点归各自 scope 管
  static override partContract = {
    anatomy: colorPickerAnatomy,
    meta: colorPickerMeta,
    delegates: [colorSliderAnatomy, colorSwatchPickerAnatomy],
  }

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
    size: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    // 文案表是对象，只走 property
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare format?: ColorFormat
  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare alpha?: boolean
  declare swatches?: string[]
  declare name?: string
  declare size?: Size
  declare direction?: Direction
  declare placement?: Placement
  declare offset?: number
  declare translations?: Partial<ColorPickerTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly pickerScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'ColorPicker',
    config: () => this.config,
    source: () => this.getPart('trigger'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  private readonly notifyValue = (details: ColorPickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: ColorPickerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyColorError = (details: ColorPickerErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('color-error', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ColorPickerSchema>(
    this,
    colorPickerMachine,
    () => this.machineProps(),
    { scope: this.pickerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  // 两条颜色滑块各自一台机器再各内嵌一台滑杆，色板一台：值与工作色从取色器现读，推动经回调送回去。
  // 几台共用一份 scope，part id 里带组件名区分，不会撞
  private readonly hueCtrl = new MachineController<ColorSliderSchema>(
    this,
    colorSliderMachine,
    () => colorPickerHueSliderProps(this.ctrl.service),
    { scope: this.pickerScope },
  )

  private readonly hueSliderCtrl = new MachineController<SliderSchema>(
    this,
    sliderMachine,
    () => colorSliderSliderProps(this.hueCtrl.service),
    { scope: this.pickerScope, onBuilt: svc => svc.refs.set('getTrackEl', () => this.mountedPart('hue-slider', 'track')) },
  )

  private readonly alphaCtrl = new MachineController<ColorSliderSchema>(
    this,
    colorSliderMachine,
    () => colorPickerAlphaSliderProps(this.ctrl.service),
    { scope: this.pickerScope },
  )

  private readonly alphaSliderCtrl = new MachineController<SliderSchema>(
    this,
    sliderMachine,
    () => colorSliderSliderProps(this.alphaCtrl.service),
    { scope: this.pickerScope, onBuilt: svc => svc.refs.set('getTrackEl', () => this.mountedPart('alpha-slider', 'track')) },
  )

  private readonly swatchCtrl = new MachineController(
    this,
    colorSwatchPickerMachine,
    () => colorPickerSwatchPickerProps(this.ctrl.service),
    { scope: this.pickerScope },
  )

  /** 连接层要的整份服务表。 */
  private services(): ColorPickerServices {
    return {
      root: this.ctrl.service,
      hueSlider: { root: this.hueCtrl.service, slider: this.hueSliderCtrl.service },
      alphaSlider: { root: this.alphaCtrl.service, slider: this.alphaSliderCtrl.service },
      swatchPicker: this.swatchCtrl.service,
    }
  }

  /** 面板的自绘条：与 content 同级挂在已经 fixed 的 positioner 上；条子走浮层 4px 档 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
    props: () => ({ size: 'sm' }),
  })

  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<ColorPickerSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
    }, this.inheritedControl)
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      format: this.format,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: control.disabled,
      readOnly: control.readOnly,
      alpha: this.alpha ?? false,
      swatches: this.swatches,
      name: this.name,
      size: this.size,
      dir: this.direction,
      placement: this.placement,
      offset: this.offset,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
      onColorError: this.notifyColorError,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.pickerScope, idGenerator: this.idGen })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 触发器记为本层分支：点它算层内交互，开合交给它自己切换。
      // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
      branches: () => [this.getPart('trigger'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  /** 三个挂载点：里面的角色节点归内嵌组件管，宿主自己的同名部件（label / control / value-text / hidden-input / swatch）不算它们。 */
  private mounts(): HTMLElement[] {
    return [...this.getParts('hue-slider'), ...this.getParts('alpha-slider'), ...this.getParts('swatch-picker')]
  }

  /** 挂载点里的某个角色节点（内嵌组件的部件）。 */
  private mountedPart(mount: string, name: string): HTMLElement | null {
    const owner = this.getPart(mount)
    return owner ? this.getParts(name).find(el => owner.contains(el)) ?? null : null
  }

  /** 宿主自己的某个角色节点：同名的部件落在挂载点里的归内嵌组件，不算宿主的。 */
  private ownPart(name: string): HTMLElement | null {
    const mounts = this.mounts()
    return this.getParts(name).find(el => !mounts.some(mount => mount.contains(el))) ?? null
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入；节点一律懒读，建机器时 partMap 还空着。
  private injectRefs(svc: Service<ColorPickerSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: (this.open ?? this.defaultOpen) ?? false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getAreaEl', () => this.getPart('saturation-area'))
  }

  /** 提前发现一次角色节点，使 default-open 时状态机在 hostConnected 中就能取到 content。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 命令式入口共用的取法；状态机在进入文档（hostConnected）后才建立，尚未建立时返回 null，调用方退回空操作。
   */
  private api(): ReturnType<typeof connectColorPicker> | null {
    return this.ctrl.service ? connectColorPicker(this.services(), wcNormalize) : null
  }

  /**
   * 写入一个新颜色，与点击预设色板同一路径（照常触发 value-change）。
   * 入参按当前 format 重新序列化后落值，因此更换 format 后再写回原值，值串会按新格式产出。
   */
  setValue(next: string): void {
    this.api()?.setValue(next)
  }

  /** 格式、输入、颜色解析与屏幕取色四路错误；状态机尚未建立时均为空。 */
  get errors(): ColorPickerErrors {
    return this.api()?.errors ?? { format: null, input: null, parse: null, eyeDropper: null }
  }

  /** 清除四路显式错误；屏幕取色重试时也会自动先清除该路错误。 */
  clearError(): void {
    this.api()?.clearError()
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

  // 挂载点内的子部件：getParts 收的是整个元素范围，按挂载点子树过滤才归得对内嵌组件。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  // hidden-input 的 style 是对象、checked 只认 DOM property，走 spread 都会写坏，两者绕开 spread 单独落
  private spreadHiddenInput(input: HTMLInputElement, props: Record<string, unknown>): void {
    const { style, checked, ...attrs } = props
    this.spreader.spread(input, attrs)
    input.checked = checked === true
    Object.assign(input.style, style as Record<string, string> | undefined)
  }

  /** 一条内嵌颜色滑块：挂载点顶替它的 root，里面的 label / control / track / thumb / value-text / hidden-input 逐个打。 */
  private wireSlider(mountName: string, mountProps: Record<string, unknown>, slider: ColorSliderApi): void {
    const mount = this.getPart(mountName)
    if (!mount)
      return
    this.spreader.spread(mount, mountProps)
    for (const el of this.partsIn(mount, 'label'))
      this.spreader.spread(el, slider.getLabelProps() as Record<string, unknown>)
    for (const el of this.partsIn(mount, 'control'))
      this.spreader.spread(el, slider.getControlProps() as Record<string, unknown>)
    for (const el of this.partsIn(mount, 'track'))
      this.spreader.spread(el, slider.getTrackProps() as Record<string, unknown>)
    for (const el of this.partsIn(mount, 'thumb'))
      this.spreader.spread(el, slider.getThumbProps() as Record<string, unknown>)
    for (const el of this.partsIn(mount, 'hidden-input'))
      this.spreader.spread(el, slider.getHiddenInputProps() as Record<string, unknown>)
    // 属性先落，再填显示文字；作者自己写了内容就归作者，元素不再改写
    for (const el of this.partsIn(mount, 'value-text')) {
      this.spreader.spread(el, slider.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(el, String(slider.channelValue))
    }
  }

  protected wire(): void {
    const api = connectColorPicker(this.services(), wcNormalize)

    // 宿主自己的部件：同名部件落在挂载点里的归内嵌组件，这里跳过它们
    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.ownPart(name)
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
    put('saturation-area', api.getSaturationAreaProps() as Record<string, unknown>)
    put('area-thumb', api.getAreaThumbProps() as Record<string, unknown>)
    put('eye-dropper-trigger', api.getEyeDropperTriggerProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 值串的显示由元素代填（作者只需给出空节点）；作者写了内容就归作者，元素不再改写
    const valueText = this.ownPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(valueText, api.value)
    }

    // 两条内嵌颜色滑块
    this.wireSlider('hue-slider', api.getHueSliderProps() as Record<string, unknown>, api.hueSlider)
    this.wireSlider('alpha-slider', api.getAlphaSliderProps() as Record<string, unknown>, api.alphaSlider)

    // 数值框不必住在滑块里（多半与滑块各占一行），身份由它自己声明
    for (const el of this.getParts('channel-input')) {
      const channel = colorPickerToInputChannel(el.getAttribute('channel') ?? undefined)
      this.spreader.spread(el, api.getChannelInputProps({ channel }) as Record<string, unknown>)
    }

    // 预设色板：挂载点顶替色板的 root；每格身份取作者写的 value 属性，名字与禁用回 swatches 数据里查
    const swatchMount = this.getPart('swatch-picker')
    if (swatchMount) {
      this.spreader.spread(swatchMount, api.getSwatchPickerProps() as Record<string, unknown>)
      for (const el of this.partsIn(swatchMount, 'label'))
        this.spreader.spread(el, api.swatchPicker.getLabelProps() as Record<string, unknown>)
      for (const el of this.partsIn(swatchMount, 'item')) {
        const item: ColorSwatchPickerItemProps = { value: el.getAttribute('value') ?? '' }
        this.spreader.spread(el, api.swatchPicker.getItemProps(item) as Record<string, unknown>)
        for (const input of this.partsIn(el, 'hidden-input'))
          this.spreadHiddenInput(input as HTMLInputElement, api.swatchPicker.getHiddenInputProps(item) as Record<string, unknown>)
        for (const swatch of this.partsIn(el, 'swatch'))
          this.spreader.spread(swatch, api.swatchPicker.getSwatchProps(item) as Record<string, unknown>)
        for (const indicator of this.partsIn(el, 'indicator'))
          this.spreader.spread(indicator, api.swatchPicker.getIndicatorProps(item) as Record<string, unknown>)
      }
    }

    // Light DOM 常驻，WC 自管可见性：作者层若给 content 声明了 display，
    // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
    // 可见性统一由 presence 驱动，不依赖作者是否引入默认皮肤。
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

    this.bars.wire()
    this.portal.sync(this.exit.visible)
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
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
