import type { Direction } from '@xihan-ui/core'
import type { PaginationPageChangeDetails, PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import { connectPagination, paginationMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 数值属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// 空串也当缺席：`page=""` 经 Number() 会变成 0，那是个不存在的页。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/** 页码按钮自报的页数；缺失或空串一律给 NaN（见 wire 里的说明）。 */
function itemPage(el: HTMLElement): number {
  const raw = el.getAttribute('value')
  return raw == null || raw === '' ? Number.NaN : Number(raw)
}

/**
 * `<xh-pagination>` —— Light-DOM 行为宿主：作者写 root/prev-trigger/item/ellipsis/next-trigger
 * 角色节点，元素跑 pagination 机器并把 connect 产出打上去。
 *
 * root 必须是 `<nav>`：分页器是"跳到某一页"的导航地标，元素只往上打 aria-label，
 * 地标语义得由标签自己给。页码按钮须自带 `value` 属性标明是第几页。
 *
 * 页码序列（几号页、哪里该出省略号）由作者按 headless 的 `pages` 渲染，元素不替作者生成节点：
 * 生成节点就等于收走模板控制权，外层 `<li>` 壳、图标、i18n 文案都再塞不进来。
 *
 * @customElement xh-pagination
 * @attr {number} count - 总条数（不是总页数）
 * @attr {number} page-size - 每页条数，默认 10
 * @attr {number} page - 受控页码；缺省该属性即非受控
 * @attr {number} default-page - 非受控初始页，默认 1
 * @attr {number} sibling-count - 当前页两侧各显示几页，默认 1
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响排版；上一页/下一页的语义不随之翻转
 * @fires page-change - 页码变化；detail 为 `{ page: number, pageSize: number }`
 * @csspart root - nav 地标，承载 aria-label 与 data-empty
 * @csspart prev-trigger - 上一页；首页时转原生 disabled
 * @csspart next-trigger - 下一页；末页时转原生 disabled
 * @csspart item - 页码按钮，须自带 value 属性；当前页带 aria-current="page" 与 data-selected
 * @csspart ellipsis - 折叠掉的那几页的占位，对读屏隐藏
 */
export class XhPaginationElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    count: { converter: NUMBER_CONVERTER },
    pageSize: { converter: NUMBER_CONVERTER, attribute: 'page-size' },
    page: { converter: NUMBER_CONVERTER },
    defaultPage: { converter: NUMBER_CONVERTER, attribute: 'default-page' },
    siblingCount: { converter: NUMBER_CONVERTER, attribute: 'sibling-count' },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare count?: number
  declare pageSize?: number
  declare page?: number
  declare defaultPage?: number
  declare siblingCount?: number
  declare direction?: Direction
  declare translations?: Partial<PaginationTranslations>

  private readonly notify = (details: PaginationPageChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('page-change', { detail: details, bubbles: true, composed: true }))
  }

  // pagination 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<PaginationSchema>(this, paginationMachine, () => this.machineProps())

  private machineProps(): Partial<PaginationSchema['props']> {
    return {
      count: this.count,
      pageSize: this.pageSize,
      page: this.page,
      defaultPage: this.defaultPage,
      siblingCount: this.siblingCount,
      dir: this.direction,
      translations: this.translations,
      onPageChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectPagination(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)

    // 页码是多实例 part，逐个打：身份取作者写的 value。
    // 漏写时给 NaN 而不是 Number(null) 的 0：NaN 与任何页都不相等，按钮点了会被机器
    // 夹回第 1 页，但绝不会冒充当前页；Vue 侧漏写 value 拿到的同样是 NaN，两侧一致。
    for (const el of this.getParts('item')) {
      const props = api.getItemProps({ page: itemPage(el) })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    for (const el of this.getParts('ellipsis'))
      this.spreader.spread(el, api.getEllipsisProps() as Record<string, unknown>)
  }
}
