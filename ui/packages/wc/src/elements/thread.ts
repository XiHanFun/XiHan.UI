import type { IdGenerator, RuntimeConfig } from '@xihan-ui/core'
import type { ThreadSchema, ThreadStatus, ThreadStickChangeDetails, ThreadTranslations } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectThread, threadMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
// Lit 自带的转换器会把缺席落成 null，那样属性就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`threshold=""` 经 Number() 会变成 0，那是"贴到像素级才算在底"的真实取值，不是"没写"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-thread>` —— Light-DOM 行为宿主：作者写 root/viewport/content/scroll-button/live-region
 * 角色节点，元素跑 thread 机器并把 connect 产出打上去。
 *
 * 滚动本身不接管：viewport 是真正 overflow:auto 的那层，键盘（方向键、PageUp/PageDown）与滚轮
 * 全走浏览器原生通路。元素只多做一件事——内容长高时把滚动位置同步补回底部，用户一上滚就撒手，
 * 此后再长也不跟，直到他滚回底部阈值内或按下"回到底部"。这套判定全在粘底原语里，
 * 经 refs 注入的两个 getter 交给它去量。
 *
 * 播报只发生在 live-region 一处：viewport 恒 `aria-live="off"`，宿主在一轮流结束时把整段最终
 * 文本写进 live-region。中途一个字都别写——那个节点带 aria-atomic，每写一次就重念一整块。
 *
 * @customElement xh-thread
 * @attr {'idle'|'submitted'|'streaming'|'error'} status - 这一轮的运行态，只透出成 data-status，组件行为一概不看它
 * @attr {number} threshold - 距底多少 px 视为在底，默认 64
 * @fires stick-change - 粘底状态跃迁；detail 为 `{ atBottom: boolean, sticking: boolean }`
 * @csspart root - 组件根容器（承载 data-status）
 * @csspart viewport - 真正 overflow:auto 的那层；role=log + aria-live=off + tabindex=0，键盘用户靠它落脚
 * @csspart content - 内容包裹层；消息一段段长出来就是它在变高，尺寸变化观察的正是它
 * @csspart scroll-button - "回到底部"；在底时收起（hidden + 内联 display）
 * @csspart live-region - 视觉隐藏的播报区（role=status + aria-live=polite + aria-atomic）
 */
export class XhThreadElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    status: { converter: STRING_CONVERTER },
    threshold: { converter: NUMBER_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare status?: ThreadStatus
  declare threshold?: number
  /** 消息区与"回到底部"的无障碍名；connect 每帧重写，作者写在节点上会被盖掉，只能从这里给。 */
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

  /**
   * onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
   *
   * 两个 getter 都懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
   * 粘底效应自己也推迟一拍才建句柄，两头对得上。
   */
  private injectRefs(svc: Service<ThreadSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  protected wire(): void {
    const api = connectThread(this.ctrl.service, wcNormalize)

    // 角色节点晚一拍才填进来是常态：空壳先插入、内容随后由框架补齐。
    // 基类的 MutationObserver 已经为这种写法把接线重跑了一遍，但粘底句柄是在
    // 效应挂载那一刻取的节点，不跟着换的话它会一直绑在 null 上——
    // 状态照转、ARIA 照对，就是自动吸底和"回到底部"按钮全不动
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

    // 收起按钮只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住。
    // 本包的皮肤自带那条兜底规则，但宿主不能指望作者装了这份样式
    this.setPartHidden(this.getPart('scroll-button'), !api.showScrollButton)
  }
}
