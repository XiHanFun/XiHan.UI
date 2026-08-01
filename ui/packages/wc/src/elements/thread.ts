import type { IdGenerator, RuntimeConfig } from '@xihan-ui/core'
import type { ThreadSchema, ThreadStatus, ThreadStickChangeDetails, ThreadTranslations } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectThread, threadAnatomy, threadMachine, threadMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-thread>` —— Light-DOM 行为宿主：跑 thread 机器，把 connect 产出打到作者写的角色节点上。
 * 内容长高时跟随滚动到底部，用户上滚后解除粘附，滚回底部阈值内或按回到底部按钮时恢复。
 *
 * @customElement xh-thread
 * @attr {'idle'|'submitted'|'streaming'|'error'} status - 这一轮的运行态，只透出成 data-status
 * @attr {number} threshold - 距底多少 px 视为在底，默认 64
 * @fires stick-change - 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }`
 * @csspart root - 组件根容器，承载 data-status
 * @csspart viewport - 滚动容器；role=log + aria-live=off + tabindex=0
 * @csspart content - 内容包裹层，尺寸变化的观察目标
 * @csspart scroll-button - 回到底部按钮，在底时收起（hidden + 内联 display）
 * @csspart live-region - 视觉隐藏的播报区（role=status + aria-live=polite + aria-atomic）
 */
export class XhThreadElement extends XhElement {
  static override partContract = { anatomy: threadAnatomy, meta: threadMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    status: { converter: STRING_CONVERTER },
    threshold: { converter: NUMBER_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare status?: ThreadStatus
  declare threshold?: number
  /** 消息区与回到底部按钮的无障碍名，由 connect 写到节点上。 */
  declare translations?: Partial<ThreadTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly threadScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly notify = (details: ThreadStickChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('stick-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ThreadSchema>(
    this,
    threadMachine,
    () => this.machineProps(),
    { scope: this.threadScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ThreadSchema['props']> {
    return {
      status: this.status,
      threshold: this.threshold,
      translations: this.translations,
      onStickChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.threadScope, idGenerator: this.idGen })
  }

  /** 装填 config 与两个节点 getter；onBuilt 在 ctrl 构造期就跑，故 service 由参数传入。 */
  private injectRefs(svc: Service<ThreadSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  protected wire(): void {
    const api = connectThread(this.ctrl.service, wcNormalize)

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
    put('scroll-button', api.getScrollButtonProps() as Record<string, unknown>)
    put('live-region', api.getLiveRegionProps() as Record<string, unknown>)

    // 除 hidden 属性外还写内联 display，压住作者层给该 part 声明的 display
    this.setPartHidden(this.getPart('scroll-button'), !api.showScrollButton)
  }
}
