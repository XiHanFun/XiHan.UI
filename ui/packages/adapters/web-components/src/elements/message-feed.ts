import type { IdGenerator, RuntimeConfig, Service } from '@xihan-ui/core'
import type {
  MessageFeedItemFocusDetails,
  MessageFeedItemProps,
  MessageFeedSchema,
  MessageFeedStatus,
  MessageFeedStickChangeDetails,
  MessageFeedTranslations,
} from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMessageFeed, messageFeedAnatomy, messageFeedMachine, messageFeedMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-message-feed>` —— Light-DOM 行为宿主：作者写 root/viewport/list/item 等角色节点，
 * 元素把 connectMessageFeed 的产出打上去。
 *
 * 条目的身份与序号写在作者自己的节点上：`item-id`、`item-index`、可选的 `item-role`
 * 与 `item-streaming`。**不用 id**——那是 HTML 全局属性，写上去会留在 DOM 里，
 * 而 Vue 侧的同名 prop 不会，两端就分叉了。
 *
 * 消息内容一律由作者写，元素不替作者生成任何节点。
 *
 * @customElement xh-message-feed
 * @attr {number} count - 消息总数，aria-setsize 取它；不从 DOM 数
 * @attr {string} status - 这一轮的运行态：idle / submitted / streaming / error
 * @attr {number} threshold - 距底多少 px 视为在底
 * @attr {boolean} loop - 走到首尾是否回绕，默认关
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires stick-change - 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }`
 * @fires item-focus - 锚点变化；detail 为 `{ id: string | null }`
 * @csspart root - 组件根容器，承载容器兜底的 Tab 位与键盘模型
 * @csspart viewport - 滚动容器，只有几何
 * @csspart list - 内容包裹层，条目必须是它的直接子节点
 * @csspart item - 一条消息，role=article + aria-posinset / aria-setsize
 * @csspart item-label - 作者名那一格，渲了它就成为该条消息的可访问名
 * @csspart scroll-to-end-trigger - 回到底部
 * @csspart live-region - 视觉隐藏的原子播报区，一份会话只该有一个
 */
export class XhMessageFeedElement extends XhElement {
  static override partContract = { anatomy: messageFeedAnatomy, meta: messageFeedMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    count: { converter: NUMBER_CONVERTER },
    status: { converter: STRING_CONVERTER },
    threshold: { converter: NUMBER_CONVERTER },
    loop: { type: Boolean },
    size: { converter: STRING_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare count?: number
  declare status?: MessageFeedStatus
  declare threshold?: number
  declare loop?: boolean
  declare size?: MessageFeedSchema['props']['size']
  /** 消息流与回到底部按钮的可访问名。 */
  declare translations?: Partial<MessageFeedTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly feedScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly notifyStick = (details: MessageFeedStickChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('stick-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyFocus = (details: MessageFeedItemFocusDetails): void => {
    this.dispatchEvent(new CustomEvent('item-focus', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MessageFeedSchema>(
    this,
    messageFeedMachine,
    () => ({
      count: this.count,
      status: this.status,
      threshold: this.threshold,
      loop: this.loop,
      size: this.size,
      translations: this.translations,
      onStickChange: this.notifyStick,
      onItemFocus: this.notifyFocus,
    }),
    { scope: this.feedScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.feedScope, idGenerator: this.idGen })
  }

  /** 装填 config 与三个节点 getter；onBuilt 在 ctrl 构造期就跑，故 service 由参数传入。 */
  private injectRefs(svc: Service<MessageFeedSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('list'))
  }

  /** 一条消息的自报家门，全部取自作者写在节点上的 item-* 属性。 */
  private itemProps(el: HTMLElement, fallbackIndex: number): MessageFeedItemProps {
    const index = Number(el.getAttribute('item-index'))
    const role = el.getAttribute('item-role')
    return {
      id: el.getAttribute('item-id') ?? '',
      index: Number.isFinite(index) ? index : fallbackIndex,
      role: role === 'user' || role === 'assistant' || role === 'system' ? role : undefined,
      streaming: el.hasAttribute('item-streaming'),
      // 这条消息里作者写没写 item-label 决定可访问名指哪儿
      labelled: el.querySelector('[data-xh-part="item-label"]') != null,
    }
  }

  /** 滚到底部并恢复粘附。机器要等 hostConnected 才建，还没进 DOM 时如实什么都不做。 */
  scrollToBottom(): void {
    const service = this.ctrl.service as Service<MessageFeedSchema> | undefined
    service?.send({ type: 'SCROLL_TO_BOTTOM' })
  }

  protected wire(): void {
    const api = connectMessageFeed(this.ctrl.service, wcNormalize)

    // 角色节点可能晚一拍才填进来，每次接线都让句柄按当前节点重绑
    this.ctrl.service.refs.get('stick')?.retarget()

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)
    put('scroll-to-end-trigger', api.getScrollToEndTriggerProps() as Record<string, unknown>)
    put('live-region', api.getLiveRegionProps() as Record<string, unknown>)

    // 多实例 part 逐个打，消息有几条打几条
    this.getParts('item').forEach((el, index) => {
      const item = this.itemProps(el, index)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const label of el.querySelectorAll<HTMLElement>('[data-xh-part="item-label"]'))
        this.spreader.spread(label, api.getItemLabelProps({ id: item.id }) as Record<string, unknown>)
    })
  }
}
