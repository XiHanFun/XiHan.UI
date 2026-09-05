import type { LogProps, LogSchema, LogStickChangeDetails, LogTranslations } from '@xihan-ui/headless'
import type { IdGenerator, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectLog, logAnatomy, logMachine, logMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-log>` —— Light-DOM 行为宿主：作者写 root/viewport/content/line 角色节点，
 * 元素把 connectLog 的产出打上去。行长出来时跟随滚动到底部，用户上滚后解除粘附，
 * 滚回底部阈值内、按回到底部按钮或调 scrollToBottom() 时恢复。
 *
 * 行的内容不替作者生成：文本、级别、时间戳、标注都写在 line 角色节点里，元素只发身份与等宽排版。
 *
 * @customElement xh-log
 * @attr {number} rows - 视口按多少行定高；缺省时高度由皮肤给
 * @attr {boolean} loading - 行还在路上：日志区报 aria-busy，根落 data-loading
 * @fires stick-change - 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }`
 * @csspart root - 组件根容器，承载 data-loading / data-at-bottom / data-sticking
 * @csspart viewport - 滚动容器；role=log + aria-live=off + tabindex=0，按行数定高写进内联样式
 * @csspart content - 所有行的包裹层，尺寸变化的观察目标
 * @csspart line - 一行日志，只拿身份与等宽排版
 * @csspart scroll-to-end-trigger - 回到底部按钮，在底时收起（hidden + 内联 display）
 * @csspart live-region - 视觉隐藏的播报区（role=status + aria-live=polite + aria-atomic）
 */
export class XhLogElement extends XhElement {
  static override partContract = { anatomy: logAnatomy, meta: logMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    rows: { converter: NUMBER_CONVERTER },
    loading: { type: Boolean },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare rows?: number
  declare loading?: boolean
  /** 日志区与回到底部按钮的无障碍名，由 connect 写到节点上。 */
  declare translations?: Partial<LogTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly logScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly notify = (details: LogStickChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('stick-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<LogSchema>(
    this,
    logMachine,
    () => ({ onStickChange: this.notify }),
    { scope: this.logScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.logScope, idGenerator: this.idGen })
  }

  /** 装填 config 与两个节点 getter；onBuilt 在 ctrl 构造期就跑，故 service 由参数传入。 */
  private injectRefs(svc: Service<LogSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  private viewProps(): LogProps {
    return {
      rows: this.rows,
      loading: this.loading ?? false,
      translations: this.translations,
    }
  }

  /**
   * 滚回底部并恢复粘附。机器要等 hostConnected 才建，还没进 DOM 时如实什么都不做、别炸。
   * 作者不写 scroll-to-end-trigger 角色节点时，自己的按钮调它。
   */
  scrollToBottom(): void {
    const service = this.ctrl.service as Service<LogSchema> | undefined
    service?.send({ type: 'SCROLL_TO_BOTTOM' })
  }

  protected wire(): void {
    const api = connectLog(this.ctrl.service, this.configured('log', this.viewProps()), wcNormalize)

    // 角色节点可能晚一拍才填进来，每次接线都让句柄按当前节点重绑
    this.ctrl.service.refs.get('stick')?.retarget()

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('scroll-to-end-trigger', api.getScrollToEndTriggerProps() as Record<string, unknown>)
    put('live-region', api.getLiveRegionProps() as Record<string, unknown>)

    // 多实例 part 逐个打，行有几条打几条
    for (const el of this.getParts('line'))
      this.spreader.spread(el, api.getLineProps() as Record<string, unknown>)

    // 除 hidden 属性外还写内联 display，压住作者层给该 part 声明的 display
    this.setPartHidden(this.getPart('scroll-to-end-trigger'), !api.showScrollToEndTrigger)
  }
}
