import type { Cleanup, IdGenerator, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { DrawerOpenChangeDetails, DrawerSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDrawer, drawerMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 缺省为真的开关得能被 ="false" 关掉：Lit 默认的 Boolean 转换器把 fromAttribute 定义成
// `v !== null`，属性一写上去就是 true，"我要非模态"这句话在 HTML 里根本说不出口。
// 三态：缺席 = undefined（用默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 属性缺席翻成 undefined：缺省值只在 connect 里定义一次，这里不能落成 null 顶掉它。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-drawer>` —— Light-DOM 行为宿主：作者写 root/trigger/backdrop/positioner/content/... 角色节点，
 * 元素跑 drawer 机器并把 connect 产出打上去。关闭时用内联 style.display 隐藏浮层子树。
 *
 * 它就是贴边渲染的对话框：键盘与 ARIA 契约逐条相同，side 只决定滑入方向，
 * 以 data-side 落在 root 与 content 上供样式取用。
 *
 * @customElement xh-drawer
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为打开
 * @attr {boolean} modal - 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true
 * @attr {'top'|'right'|'bottom'|'left'} side - 从哪条边滑出，默认 right
 * @attr {'dialog'|'alertdialog'} role - 语义角色，默认 dialog
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} close-on-interact-outside - 点击浮层外关闭；默认跟随 modal，alertdialog 恒不关
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 留在页面原地的容器，承载 data-side / data-state
 * @csspart trigger - 触发按钮
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器（贴边布局写在它身上）
 * @csspart content - 抽屉面板（role/aria-modal/焦点陷阱所在，另带 data-side）
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 描述（aria-describedby 目标）
 * @csspart close-trigger - 关闭按钮
 */
export class XhDrawerElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  // role 不声明为响应式属性——复用 HTMLElement 原生的 role 属性反射（避免类型冲突），
  // 在 machineProps 里经 getAttribute 读取。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    modal: { converter: BOOLEAN_CONVERTER },
    side: { converter: STRING_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare modal?: boolean
  declare side?: DrawerSchema['props']['side']
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare restoreFocus?: boolean
  declare translations?: DrawerSchema['props']['translations']

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly drawerScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private backdropNode: HTMLElement | null = null

  private readonly notify = (details: DrawerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<DrawerSchema>(
    this,
    drawerMachine,
    () => this.machineProps(),
    { scope: this.drawerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<DrawerSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      modal: this.modal,
      side: this.side,
      role: (this.getAttribute('role') as DrawerSchema['props']['role']) ?? undefined,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      restoreFocus: this.restoreFocus,
      translations: this.translations,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.drawerScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackOverlay 效应负责）。
  // 连接期就注册会让层常驻栈里占着栈顶，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.contentNode,
      branches: () => [],
      isModal: () => this.machineProps().modal ?? true,
      setModal: () => {},
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<DrawerSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', null)
    svc.refs.set('getContentEl', () => this.contentNode)
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('branches', () => [])
  }

  protected wire(): void {
    const svc = this.ctrl.service
    const api = connectDrawer(svc, wcNormalize)
    const open = svc.state.get() === 'open'

    this.contentNode = this.getPart('content')
    this.backdropNode = this.getPart('backdrop')

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('backdrop', api.getBackdropProps() as Record<string, unknown>)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // Light DOM content 常驻，WC 自管可见性：关闭时隐藏浮层子树。
    // 用内联 style.display 而非 hidden——抽屉的贴边布局（作者层）通常给 positioner
    // 声明了 display，优先级高于 UA 的 [hidden]{display:none}，hidden 压不住；内联样式才压得住。
    // Vue 靠卸载不走这条路，其退场动画不受影响。
    const positioner = this.getPart('positioner')
    if (positioner)
      this.setPartHidden(positioner, !open)
    if (this.backdropNode)
      this.setPartHidden(this.backdropNode, !open)
    // content 自己也要兜：positioner 不是必需部件（见 drawerMeta），
    // 作者按最小合规结构只写 root + content 时，上面两句一句都命中不了，
    // 收起的抽屉就一直摊在页面上、点关闭也收不起来。
    this.setPartHidden(this.contentNode, !open)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
