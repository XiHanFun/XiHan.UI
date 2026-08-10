import type { LogProps, LogTranslations, ThreadSchema, ThreadStickChangeDetails } from '@xihan-ui/headless'
import type { IdGenerator, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectLog, logAnatomy, logMeta, threadMachine } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-log>` —— Light-DOM 行为宿主：作者写 root/viewport/content/line 角色节点，
 * 元素把 connectLog 的产出打上去。行长出来时跟随滚动到底部，用户上滚后解除粘附，
 * 滚回底部阈值内或调 scrollToBottom() 时恢复。
 *
 * 粘底整套复用 thread 的机器：它只认滚动容器与内容容器两个节点，不认解剖。
 *
 * 行的内容不替作者生成：文本、级别、时间戳、标注都写在 line 角色节点里，元素只发身份与等宽排版。
 *
 * @customElement xh-log
 * @attr {number} rows - 视口按多少行定高；缺省时高度由皮肤给
 * @attr {boolean} loading - 行还在路上：日志区报 aria-busy，根落 data-loading
 * @fires stick-change - 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }`
 * @csspart root - 组件根容器，承载 data-loading / data-at-bottom / data-sticking
 * @csspart viewport - 滚动容器；role=log + tabindex=0，按行数定高写进内联样式
 * @csspart content - 所有行的包裹层，尺寸变化的观察目标
 * @csspart line - 一行日志，只拿身份与等宽排版
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
  /** 日志区的无障碍名，由 connect 写到视口上。 */
  declare translations?: Partial<LogTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly logScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly notify = (details: ThreadStickChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('stick-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ThreadSchema>(
    this,
    threadMachine,
    () => ({ onStickChange: this.notify }),
    { scope: this.logScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.logScope, idGenerator: this.idGen })
  }

  /** 装填 config 与两个节点 getter；onBuilt 在 ctrl 构造期就跑，故 service 由参数传入。 */
  private injectRefs(svc: Service<ThreadSchema>): void {
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
   * 元素不带内置的"回到底部"按钮，作者自己的按钮调它。
   */
  scrollToBottom(): void {
    const service = this.ctrl.service as Service<ThreadSchema> | undefined
    service?.send({ type: 'SCROLL_TO_BOTTOM' })
  }

  protected wire(): void {
    const api = connectLog(this.ctrl.service, this.viewProps(), wcNormalize)

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

    // 多实例 part 逐个打，行有几条打几条
    for (const el of this.getParts('line'))
      this.spreader.spread(el, api.getLineProps() as Record<string, unknown>)
  }
}
