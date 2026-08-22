import type { LayoutSchema, LayoutSiderCollapsedChangeDetails, LayoutSiderPlacement } from '@xihan-ui/headless'
import { connectLayout, layoutAnatomy, layoutMachine, layoutMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-layout>` —— 页面骨架的 Light-DOM 行为宿主，跑 layout 机器并把 connect 产出打到
 * root/header/sider/content/footer/sider-trigger 角色节点。
 *
 * 除 root 外的部件全部可缺省。各段一律不带 role：地标该不该标、标在哪一段，
 * 取决于这套骨架在页面里的位置，由作者自己声明。
 *
 * 侧栏宽度只写成 sider 上的内联 inline-size，宽度过渡由皮肤声明。
 *
 * 固定定位只落 data-fixed 标记：钉住的实现（含滚动容器的分工）归皮肤。
 *
 * @customElement xh-layout
 * @attr {boolean} sider-collapsed - 受控折叠态；缺省该属性即非受控
 * @attr {boolean} default-sider-collapsed - 非受控初始为折叠
 * @attr {string} sider-width - 展开时侧栏的宽度，任意 CSS 长度
 * @attr {string} sider-collapsed-width - 折叠时侧栏的宽度，任意 CSS 长度
 * @attr {'start'|'end'} sider-placement - 侧栏挂在行首还是行尾，缺省 start
 * @attr {boolean} header-fixed - 头吸顶：滚动时头钉在滚动容器的上沿
 * @attr {boolean} sider-fixed - 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条
 * @attr {boolean} bordered - 在头、侧栏、脚与内容之间画分隔线
 * @fires sider-collapsed-change - 折叠态变化；detail 为 `{ collapsed: boolean }`
 * @csspart root - 骨架根容器，承载 data-sider-placement / data-sider-collapsed / data-header-fixed / data-sider-fixed / data-bordered
 * @csspart header - 顶部横幅区，横贯整行；吸顶时带 data-fixed
 * @csspart sider - 侧栏，折叠时带 data-collapsed、宽度随之在两档之间切换；吸附时带 data-fixed
 * @csspart content - 主内容区
 * @csspart footer - 底部区，横贯整行
 * @csspart sider-trigger - 折叠把手（aria-expanded / aria-controls 所在，折叠时带 data-collapsed）
 */
export class XhLayoutElement extends XhElement {
  // 把手写成非 button 时 Enter/Space 的激活会静默失效，登记进契约
  static override partContract = {
    anatomy: layoutAnatomy,
    meta: layoutMeta,
    tags: { 'sider-trigger': ['button'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    siderCollapsed: {
      attribute: 'sider-collapsed',
      converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') },
    },
    defaultSiderCollapsed: { type: Boolean, attribute: 'default-sider-collapsed' },
    siderWidth: { attribute: 'sider-width', converter: STRING_CONVERTER },
    siderCollapsedWidth: { attribute: 'sider-collapsed-width', converter: STRING_CONVERTER },
    siderPlacement: { attribute: 'sider-placement', converter: STRING_CONVERTER },
    headerFixed: { type: Boolean, attribute: 'header-fixed' },
    siderFixed: { type: Boolean, attribute: 'sider-fixed' },
    bordered: { type: Boolean },
  }

  declare siderCollapsed?: boolean
  declare defaultSiderCollapsed?: boolean
  declare siderWidth?: string
  declare siderCollapsedWidth?: string
  declare siderPlacement?: LayoutSiderPlacement
  declare headerFixed?: boolean
  declare siderFixed?: boolean
  declare bordered?: boolean

  private readonly notify = (details: LayoutSiderCollapsedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('sider-collapsed-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<LayoutSchema>(this, layoutMachine, () => this.machineProps())

  private machineProps(): Partial<LayoutSchema['props']> {
    return {
      siderCollapsed: this.siderCollapsed,
      defaultSiderCollapsed: this.defaultSiderCollapsed ?? false,
      siderWidth: this.siderWidth,
      siderCollapsedWidth: this.siderCollapsedWidth,
      siderPlacement: this.siderPlacement,
      headerFixed: this.headerFixed ?? false,
      siderFixed: this.siderFixed ?? false,
      bordered: this.bordered ?? false,
      onSiderCollapsedChange: this.notify,
    }
  }

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectLayout(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('sider', api.getSiderProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    put('sider-trigger', api.getSiderTriggerProps() as Record<string, unknown>)
  }
}
