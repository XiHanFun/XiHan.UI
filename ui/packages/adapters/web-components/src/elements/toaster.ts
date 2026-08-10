import type {
  ResolvedToast,
  ToasterApi,
  ToasterSchema,
  ToasterToastsChangeDetails,
  ToasterTranslations,
  ToastOptions,
  ToastPlacement,
  ToastRecord,
  ToastStatusChangeDetails,
} from '@xihan-ui/headless'
import { connectToaster, toasterAnatomy, toasterMachine, toasterMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：max="" 经 Number() 会变成 0，那等于"一条都不显示"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用缺省）、在场=true、显式写 "false"=false。
// 与 `<xh-toast>` 上的同名开关同一套写法，两处的 HTML 说法才对得上
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * 这一摞对应哪个位置。属性缺席就交 undefined，由 connect 回落到 toaster 的 placement。
 * 写坏了照原样交出去：它与九个位没有一个对得上，这摞就一直是空的——
 * 空得明显好过悄悄冒充另一个位置，把通知摆到作者没想到的角落。
 */
function groupPlacement(el: HTMLElement): ToastPlacement | undefined {
  const raw = el.getAttribute('placement')
  return raw == null || raw === '' ? undefined : (raw as ToastPlacement)
}

/**
 * `<xh-toaster>` —— Light-DOM 行为宿主：作者写 root 与若干 group 角色节点，
 * 元素跑 toaster 机器并把 connect 产出打上去。每个 group 用 `placement` 属性声明自己是哪个位置，
 * 不写就落在 toaster 的 placement 上。
 *
 * 单条通知的节点由作者按队列渲染（读 `visibleToasts` 或听 `toasts-change`），元素不替作者生成：
 * 生成节点就等于收走模板控制权，图标、进度条、i18n 文案都再塞不进来。
 * 每条渲染成一个 `<xh-toast>`，它走完退场会冒泡一条 status-change，本元素据此把记录删掉。
 *
 * @customElement xh-toaster
 * @attr {'top-start'|'top'|'top-end'|'middle-start'|'middle'|'middle-end'|'bottom-start'|'bottom'|'bottom-end'} placement - 默认落位，默认 bottom-end
 * @attr {number} max - 每个位置最多同时留几条，超出挤掉最旧的；不给即不限
 * @attr {number} gap - 同一摞内的间距（px），默认 16
 * @attr {number} duration - 单条没写 duration 时的默认停留毫秒
 * @attr {number} remove-delay - 单条没写 remove-delay 时的默认退场窗口毫秒
 * @attr {boolean} pause-on-page-idle - 页面切到后台时按住计时，逐条下发
 * @fires toasts-change - 队列变化；detail 为 `{ toasts: ToastRecord[] }`
 * @csspart root - role=region 的地标容器，承载 data-count / data-empty
 * @csspart group - 某一个位置上的那一摞，可自带 placement 属性；承载 data-placement / data-count / data-empty 与间距
 */
export class XhToasterElement extends XhElement {
  static override partContract = { anatomy: toasterAnatomy, meta: toasterMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 队列与文案都是对象，走不了属性；只作为 property 暴露，与 Vue 侧的同名 prop 对齐。
    // toasts 给了即受控：元素内部的写入只发 toasts-change，等宿主自己写回
    toasts: { attribute: false },
    defaultToasts: { attribute: false },
    placement: { converter: STRING_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    gap: { converter: NUMBER_CONVERTER },
    duration: { converter: NUMBER_CONVERTER },
    removeDelay: { converter: NUMBER_CONVERTER, attribute: 'remove-delay' },
    pauseOnPageIdle: { converter: BOOLEAN_CONVERTER, attribute: 'pause-on-page-idle' },
    translations: { attribute: false },
  }

  declare toasts?: ToastRecord[]
  declare defaultToasts?: ToastRecord[]
  declare placement?: ToastPlacement
  declare max?: number
  declare gap?: number
  declare duration?: number
  declare removeDelay?: number
  declare pauseOnPageIdle?: boolean
  declare translations?: Partial<ToasterTranslations>

  private readonly notify = (details: ToasterToastsChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('toasts-change', { detail: details, bubbles: true, composed: true }))
  }

  // toaster 机器只有队列这一份状态，无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<ToasterSchema>(this, toasterMachine, () => this.machineProps())

  private machineProps(): Partial<ToasterSchema['props']> {
    return {
      toasts: this.toasts,
      defaultToasts: this.defaultToasts,
      placement: this.placement,
      max: this.max,
      gap: this.gap,
      duration: this.duration,
      removeDelay: this.removeDelay,
      pauseOnPageIdle: this.pauseOnPageIdle,
      translations: this.translations,
      onToastsChange: this.notify,
    }
  }

  /**
   * 命令式入口共用的取法。机器要到进文档（hostConnected）才建：
   * 还没进文档就发通知是调用方的时序问题，明说好过把这条通知静默丢掉。
   */
  private commands(): ToasterApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-toaster> 还没进文档，命令式接口此时不可用')
    return connectToaster(this.ctrl.service, wcNormalize)
  }

  /** 入队并返回 id；同 id 已存在则就地改写，位置不动（loading 转 success 走的就是这条）。 */
  create(options: ToastOptions = {}): string {
    return this.commands().create(options)
  }

  /**
   * 刻意不叫 `update`：那是 Lit 自己的渲染生命周期钩子，占用它会让宿主每次重渲
   * 都拐进这里来（还带着一个 changedProperties 当 id），组件当场不工作。
   * Vue 侧没有这层基类，composable 上仍叫 `update`。
   */
  updateToast(id: string, options: Partial<ToastOptions>): void {
    this.commands().update(id, options)
  }

  dismiss(id: string): void {
    this.commands().dismiss(id)
  }

  dismissAll(): void {
    this.commands().dismissAll()
  }

  /** max 之内、按加入先后排列的可见条目，已补齐默认值，可直接摊给 `<xh-toast>`。 */
  get visibleToasts(): ResolvedToast[] {
    return this.commands().visibleToasts
  }

  /** 当前有条目的位置，按九宫格固定顺序。 */
  get placements(): ToastPlacement[] {
    return this.commands().placements
  }

  get count(): number {
    return this.commands().count
  }

  getToastsByPlacement(placement: ToastPlacement): ResolvedToast[] {
    return this.commands().getToastsByPlacement(placement)
  }

  /**
   * 单条通知走完退场会冒泡上来：记录该从队列里删掉了。
   * 认元素名而不是只认事件名——avatar 之类的部件也派 status-change，且完全可能就摆在通知内部。
   */
  private readonly onToastStatus = (event: Event): void => {
    const target = event.target as Element | null
    if (target?.tagName.toLowerCase() !== 'xh-toast')
      return
    const detail = (event as CustomEvent<ToastStatusChangeDetails>).detail
    if (detail?.status !== 'unmounted')
      return
    // 整页拆除时可能先停机再收到最后一条：停机后送事件在 dev 下会抛
    if (this.ctrl.service?.getStatus() !== 'Started')
      return
    this.dismiss(detail.id)
  }

  override connectedCallback(): void {
    super.connectedCallback()
    // 挂在自己身上而不是逐条通知上：条目是作者渲染的，元素看不见它们的出生与死亡
    this.addEventListener('status-change', this.onToastStatus)
  }

  override disconnectedCallback(): void {
    this.removeEventListener('status-change', this.onToastStatus)
    super.disconnectedCallback()
  }

  protected wire(): void {
    const api = connectToaster(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 摞是多实例 part，逐个打：位置取作者写的 placement 属性
    for (const el of this.getParts('group'))
      this.spreader.spread(el, api.getGroupProps({ placement: groupPlacement(el) }) as Record<string, unknown>)
  }
}
