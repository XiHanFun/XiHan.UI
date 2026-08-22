import type { InfiniteScrollSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { connectInfiniteScroll, infiniteScrollAnatomy, infiniteScrollMachine, infiniteScrollMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined、在场=true、显式写 "false"=false
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-infinite-scroll>` —— 无限滚动行为宿主：摆在列表末尾的哨兵一进可视区就报「该取下一页了」。
 *
 * 滚动本身一概不接管，走浏览器原生通路；触发的判据是哨兵与可视区的交叠。
 * 列表滚在某个 overflow 容器里时把容器交给 target：distance 的提前量扩的正是那块可视区，
 * 不给就只对窗口视口生效，落到列表上等于没写。
 * 观察器只在 idle 挂着：loading 与 disabled 两段都不观察，哨兵留在可视区里也不会连着触发第二次。
 *
 * @customElement xh-infinite-scroll
 * @attr {number} distance - 提前量（px）：哨兵离可视区还有这么远就算进入，默认 0
 * @attr {boolean} disabled - 关掉，不再观察也不再触发
 * @attr {boolean} loading - 正在取数，其间不观察、不重复触发；取完由宿主写回 false
 * @fires load - 该取下一页了
 * @csspart root - 列表外壳，承载 data-loading / data-disabled 与 aria-busy
 * @csspart sentinel - 哨兵，摆在列表末尾；对读屏隐藏
 */
export class XhInfiniteScrollElement extends XhElement {
  static override partContract = { anatomy: infiniteScrollAnatomy, meta: infiniteScrollMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    distance: { converter: NUMBER_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    // 滚动容器是 DOM 句柄，只走 property；不给即以窗口视口为准
    target: { attribute: false },
  }

  declare distance?: number
  declare disabled?: boolean
  declare loading?: boolean
  declare target?: HTMLElement | null

  private readonly notify = (): void => {
    this.dispatchEvent(new CustomEvent('load', { bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<InfiniteScrollSchema>(
    this,
    infiniteScrollMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<InfiniteScrollSchema['props']> {
    return {
      distance: this.distance,
      disabled: this.disabled,
      loading: this.loading,
      onLoad: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  // 哨兵惰性读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<InfiniteScrollSchema>): void {
    svc.refs.set('getSentinelEl', () => this.getPart('sentinel'))
    svc.refs.set('getTargetEl', () => this.target ?? null)
  }

  protected wire(): void {
    const api = connectInfiniteScroll(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('sentinel', api.getSentinelProps() as Record<string, unknown>)
  }
}
