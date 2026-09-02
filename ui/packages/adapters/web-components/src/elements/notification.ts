import type {
  NotificationApi,
  NotificationItemsChangeDetails,
  NotificationOptions,
  NotificationPlacement,
  NotificationRecord,
  NotificationSchema,
  NotificationTranslations,
  NotificationType,
  ResolvedNotification,
  ToastActionDetails,
  ToastSchema,
  ToastStatusChangeDetails,
} from '@xihan-ui/headless'
import {
  connectNotification,
  connectNotificationItem,
  notificationAnatomy,
  notificationMachine,
  notificationMeta,
  toastMachine,
} from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：max="" 经 Number() 会变成 0，那等于"一条都不显示"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（closable）只有三态才关得掉——Lit 默认的 Boolean 转换器是 v !== null，
// 写 closable="false" 照样是真，"这条不许关"在 HTML 里就说不出口
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * 这一摞对应哪个位置。属性缺席就交 undefined，由 connect 回落到队列的 placement。
 * 写坏了照原样交出去：它与九个位没有一个对得上，这摞就一直是空的——
 * 空得明显好过悄悄冒充另一个位置，把通知摆到作者没想到的角落。
 */
function groupPlacement(el: HTMLElement): NotificationPlacement | undefined {
  const raw = el.getAttribute('placement')
  return raw == null || raw === '' ? undefined : (raw as NotificationPlacement)
}

/**
 * `<xh-notification>` —— Light-DOM 行为宿主：作者写 root 与若干 group 角色节点，
 * 元素跑 notification 机器并把 connect 产出打上去。每个 group 用 `placement` 属性声明自己是哪个位置，
 * 不写就落在队列的 placement 上。
 *
 * 单条通知的节点由作者按队列渲染（读 `items` 或听 `items-change`），元素不替作者生成：
 * 生成节点就等于收走模板控制权，图标、进度条、i18n 文案都再塞不进来。
 * 每条渲染成一个 `<xh-notification-item>`，它走完退场会冒泡一条 status-change，本元素据此把记录删掉。
 *
 * @customElement xh-notification
 * @attr {'top-start'|'top'|'top-end'|'middle-start'|'middle'|'middle-end'|'bottom-start'|'bottom'|'bottom-end'} placement - 默认落位，默认 bottom-end
 * @attr {number} max - 每个位置最多同时留几条，超出挤掉最旧的；不给即不限
 * @attr {number} gap - 同一摞内的间距（px），默认 16
 * @attr {number} duration - 单条没写 duration 时的默认停留毫秒
 * @attr {number} remove-delay - 单条没写 remove-delay 时的默认退场窗口毫秒
 * @attr {boolean} pause-on-page-idle - 页面切到后台时按住计时，逐条下发
 * @fires items-change - 队列变化；detail 为 `{ items: NotificationRecord[] }`
 * @csspart root - 队列的作用域包装（display: contents，不占布局），承载 data-count / data-empty
 * @csspart group - role=region 的地标，某一个位置上的那一摞；可自带 placement 属性，承载 data-placement / data-count / data-empty 与间距
 */
export class XhNotificationElement extends XhElement {
  static override partContract = { anatomy: notificationAnatomy, meta: notificationMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 队列与文案都是对象，走不了属性；只作为 property 暴露，与 Vue 侧的同名 prop 对齐。
    // items 给了即受控：元素内部的写入只发 items-change，等宿主自己写回
    items: { attribute: false },
    defaultItems: { attribute: false },
    placement: { converter: STRING_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    gap: { converter: NUMBER_CONVERTER },
    duration: { converter: NUMBER_CONVERTER },
    removeDelay: { converter: NUMBER_CONVERTER, attribute: 'remove-delay' },
    pauseOnPageIdle: { converter: BOOLEAN_CONVERTER, attribute: 'pause-on-page-idle' },
    translations: { attribute: false },
  }

  declare items?: NotificationRecord[]
  declare defaultItems?: NotificationRecord[]
  declare placement?: NotificationPlacement
  declare max?: number
  declare gap?: number
  declare duration?: number
  declare removeDelay?: number
  declare pauseOnPageIdle?: boolean
  declare translations?: Partial<NotificationTranslations>

  private readonly notify = (details: NotificationItemsChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('items-change', { detail: details, bubbles: true, composed: true }))
  }

  // 队列机器只有条目这一份状态，无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<NotificationSchema>(this, notificationMachine, () => this.machineProps())

  private machineProps(): Partial<NotificationSchema['props']> {
    return {
      items: this.items,
      defaultItems: this.defaultItems,
      placement: this.placement,
      max: this.max,
      gap: this.gap,
      duration: this.duration,
      removeDelay: this.removeDelay,
      pauseOnPageIdle: this.pauseOnPageIdle,
      translations: this.translations,
      onItemsChange: this.notify,
    }
  }

  /**
   * 命令式入口共用的取法。机器要到进文档（hostConnected）才建：
   * 还没进文档就发通知是调用方的时序问题，明说好过把这条通知静默丢掉。
   */
  private commands(): NotificationApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-notification> 还没进文档，命令式接口此时不可用')
    return connectNotification(this.ctrl.service, wcNormalize)
  }

  /** 入队并返回 id；同 id 已存在则就地改写，位置不动（处理中转已完成走的就是这条）。 */
  create(options: NotificationOptions = {}): string {
    return this.commands().create(options)
  }

  /**
   * 刻意不叫 `update`：那是 Lit 自己的渲染生命周期钩子，占用它会让宿主每次重渲
   * 都拐进这里来（还带着一个 changedProperties 当 id），组件当场不工作。
   * Vue 侧没有这层基类，composable 上仍叫 `update`。
   */
  updateItem(id: string, options: Partial<NotificationOptions>): void {
    this.commands().update(id, options)
  }

  dismiss(id: string): void {
    this.commands().dismiss(id)
  }

  dismissAll(): void {
    this.commands().dismissAll()
  }

  /** max 之内、按加入先后排列的可见条目，已补齐默认值，可直接摊给 `<xh-notification-item>`。 */
  get visibleNotifications(): ResolvedNotification[] {
    return this.commands().visibleNotifications
  }

  /** 当前有条目的位置，按九宫格固定顺序。 */
  get placements(): NotificationPlacement[] {
    return this.commands().placements
  }

  get count(): number {
    return this.commands().count
  }

  getItemsByPlacement(placement: NotificationPlacement): ResolvedNotification[] {
    return this.commands().getItemsByPlacement(placement)
  }

  /**
   * 单条通知走完退场会冒泡上来：记录该从队列里删掉了。
   * 认元素名而不是只认事件名——avatar 之类的部件也派 status-change，且完全可能就摆在通知内部。
   */
  private readonly onItemStatus = (event: Event): void => {
    const target = event.target as Element | null
    if (target?.tagName.toLowerCase() !== 'xh-notification-item')
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
    this.addEventListener('status-change', this.onItemStatus)
  }

  override disconnectedCallback(): void {
    this.removeEventListener('status-change', this.onItemStatus)
    super.disconnectedCallback()
  }

  protected wire(): void {
    const api = connectNotification(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 摞是多实例 part，逐个打：位置取作者写的 placement 属性
    for (const el of this.getParts('group'))
      this.spreader.spread(el, api.getGroupProps({ placement: groupPlacement(el) }) as Record<string, unknown>)
  }
}

// 卡片元素自带一份契约：它只出现在队列渲染出来的那一层，root 与 group 不归它。
const ITEM_CONTRACT = { anatomy: notificationAnatomy, meta: { component: 'notification', requiredParts: ['item'] } }

/**
 * `<xh-notification-item>` —— 单条通知卡片：作者写 item/item-indicator/item-title/
 * item-description/item-action-trigger/item-close-trigger 角色节点，
 * 元素跑生命周期机器并把 connect 产出打上去。
 *
 * item 承载 role 与 aria-live：默认 status + polite（排队等读屏的空隙），
 * type="error" 换成 alert + assertive（打断当前朗读）。指针停在卡片上、
 * 或焦点落进卡片内部都会把倒计时按住，离开才接着走剩下的那一段。
 *
 * 退场窗口走完只把卡片收起、不删节点：作者写在里面的内容归作者，
 * 什么时候把这条从队列里删掉是 `<xh-notification>` 的事（它收本元素冒泡上去的 status-change）。
 *
 * @customElement xh-notification-item
 * @attr {string} id - 队列身份，`<xh-notification>` 按它寻址；不给就用实例自己的 scope id
 * @attr {string} title - 标题文案；作者没在 item-title 部件里写内容时由元素填入
 * @attr {string} description - 补充说明；作者没在 item-description 部件里写内容时由元素填入
 * @attr {'info'|'success'|'warning'|'error'|'loading'} type - 语气，默认 info；loading 不自动消失
 * @attr {number} duration - 停留毫秒，默认 5000；<=0 即关掉自动消失
 * @attr {number} remove-delay - 退场窗口毫秒，默认 200，留给退场动画
 * @attr {boolean} closable - 是否给可用的关闭按钮，默认 true；写 closable="false" 关掉
 * @attr {boolean} pause-on-page-idle - 页面切到后台时按住计时，默认关
 * @fires status-change - 生命周期落位；detail 为 `{ id: string, status: 'dismissing'|'unmounted' }`
 * @fires action - 操作按钮被按下；detail 为 `{ id: string }`
 * @csspart item - role=status（error 时 alert）的卡片，承载 data-severity / data-tone / data-state / data-paused
 * @csspart item-indicator - 类型指示符；留空即由皮肤按 data-severity 画一枚兜底字形
 * @csspart item-title - 标题，aria-labelledby 的目标
 * @csspart item-description - 补充说明，aria-describedby 的目标
 * @csspart item-action-trigger - 操作按钮：先发 action 再进入退场
 * @csspart item-close-trigger - 关闭按钮；closable=false 时转原生 disabled 并收起
 */
export class XhNotificationItemElement extends XhElement {
  static override partContract = ITEM_CONTRACT

  // 字段名与属性名分家的两处都是躲原生访问器：HTMLElement 的 id 与 title 都是原生反射属性，
  // 同名声明会盖掉它们（`el.id` 从此不再是 DOM id）。属性名保持与 Vue 侧的 prop 同名。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    itemId: { converter: STRING_CONVERTER, attribute: 'id' },
    titleText: { converter: STRING_CONVERTER, attribute: 'title' },
    description: { converter: STRING_CONVERTER },
    type: { converter: STRING_CONVERTER },
    duration: { converter: NUMBER_CONVERTER },
    removeDelay: { converter: NUMBER_CONVERTER, attribute: 'remove-delay' },
    closable: { converter: BOOLEAN_CONVERTER },
    pauseOnPageIdle: { converter: BOOLEAN_CONVERTER, attribute: 'pause-on-page-idle' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare itemId?: string
  declare titleText?: string
  declare description?: string
  declare type?: NotificationType
  declare duration?: number
  declare removeDelay?: number
  declare closable?: boolean
  declare pauseOnPageIdle?: boolean
  declare translations?: Partial<NotificationTranslations>

  private readonly notifyStatus = (details: ToastStatusChangeDetails): void => {
    // 必须冒泡：外层 `<xh-notification>` 就靠这条事件知道该把记录删掉了
    this.dispatchEvent(new CustomEvent('status-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyAction = (details: ToastActionDetails): void => {
    this.dispatchEvent(new CustomEvent('action', { detail: details, bubbles: true, composed: true }))
  }

  // 计时器与 visibilitychange 都由机器自己经 scope 拿，不需要 config/layer/定位引擎。
  // 跑的是 toast 那台机器，文案桶却要跟着通知走：不写 configName 的话，
  // 改这颗叉的读屏名会连所有轻提示一起改
  private readonly ctrl = new MachineController<ToastSchema>(this, toastMachine, () => this.machineProps(), { configName: 'notification' })

  private machineProps(): Partial<ToastSchema['props']> {
    return {
      id: this.itemId,
      title: this.titleText,
      description: this.description,
      type: this.type,
      duration: this.duration,
      removeDelay: this.removeDelay,
      closable: this.closable,
      pauseOnPageIdle: this.pauseOnPageIdle,
      translations: this.translations,
      onStatusChange: this.notifyStatus,
      onAction: this.notifyAction,
    }
  }

  /** 这个部件的文字归不归作者：头一回见到它时定案，之后不再改口。 */
  private readonly authorOwnsText = new WeakMap<HTMLElement, boolean>()

  /**
   * 作者没往部件里写内容时，用 props 上的文案填进去。
   *
   * 归属只判一次：判完本轮就会把文字写进去，再回读分不清是作者写的还是自己写的，
   * 从那以后 title 属性改了也再刷不动（Vue 侧是响应式渲染，会跟着改，两侧就此分叉）。
   */
  private fillText(el: HTMLElement | null, text: string | undefined): void {
    if (!el)
      return
    let authored = this.authorOwnsText.get(el)
    if (authored === undefined) {
      // 头一回见到这个节点：此刻里面的东西只可能是作者写的（本轮写入尚未发生）。
      // 元素子节点也算数——只放了个图标、文字留给 props 的标题同样是作者写过的，
      // 只看文字会把那个图标当空白冲掉
      authored = el.childElementCount > 0 || (el.textContent ?? '').trim() !== ''
      this.authorOwnsText.set(el, authored)
    }
    if (authored)
      return
    const next = text ?? ''
    // 比一次再写：写文本节点会命中宿主的变动观察器，值没变就别去惊动它
    if (el.textContent !== next)
      el.textContent = next
  }

  protected wire(): void {
    const api = connectNotificationItem(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('item', api.getItemProps() as Record<string, unknown>)
    put('item-indicator', api.getItemIndicatorProps() as Record<string, unknown>)
    put('item-title', api.getItemTitleProps() as Record<string, unknown>)
    put('item-description', api.getItemDescriptionProps() as Record<string, unknown>)
    put('item-action-trigger', api.getItemActionTriggerProps() as Record<string, unknown>)
    put('item-close-trigger', api.getItemCloseTriggerProps() as Record<string, unknown>)

    this.fillText(this.getPart('item-title'), api.title)
    this.fillText(this.getPart('item-description'), api.description)

    // connect 已经置了 hidden，但作者层给 [data-part=item] 写的任何一条 display
    // 都盖得过 UA 的 [hidden]{display:none}；内联 style.display 优先级更高，压得住。
    // 关闭按钮同理：不可关闭时留一个按不动的叉，比压根没有叉更让人困惑
    this.setPartHidden(this.getPart('item'), api.status === 'unmounted')
    this.setPartHidden(this.getPart('item-close-trigger'), !api.closable)
  }
}
