/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { ControlVariant, Direction, IconRecord, Orientation, Service, Size } from '@xihan-ui/core'
import type { ToolbarItemProps, ToolbarSchema, ToolbarTranslations } from '@xihan-ui/headless'
import { ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectToolbar, toolbarAnatomy, toolbarMachine, toolbarMeta, toolbarOverflowMenuProps } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { createDisabledDeclarations } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { MachineController } from '../runtime/machine-controller'
import { OverflowMenuController } from '../runtime/overflow-menu-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { XhIconElement } from './icon'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-toolbar>`：Light-DOM 行为宿主：作者写 root、若干 item，可选的 group、separator 与
 * 行尾的 overflow-trigger，元素运行 toolbar 状态机并把 connect 产出接上。
 *
 * 工具条只负责三件事：整条一个 Tab 位的方向键导航，role=toolbar / role=group /
 * role=separator 这套 ARIA，以及放不下时把条目按次序收进「更多」菜单。条目自身是按钮、
 * 切换按钮还是下拉触发器，各自的角色、按下态与点击行为一律归条目自身：元素不覆盖条目的 role，
 * 也不接管条目的 click。条目身份取写在条目上的 value 属性；禁用由条目声明 aria-disabled
 * （集合条目一律如此，原生 disabled 不可聚焦、无法作为方向键的起点）；只放图标的条目写 data-icon-only，按方钮画。
 * 位于 form 中的按钮式条目需自行写 type="button"，否则回车会直接提交表单。
 *
 * 「更多」菜单的定位层、列表与条目由元素自己建（与每页条数下拉、自绘滚动条同一条路）：
 * 作者只在 root 末尾写一颗 overflow-trigger。建出来的节点归 menu 的 scope，不写 data-xh-part。
 *
 * 导航在事件发生时按 data-scope + data-part 查询 DOM，依赖 connect 回写的 data-value，
 * 因此 wire 必须先于交互运行（基类 updated 已保证）。
 *
 * @customElement xh-toolbar
 * @attr {'horizontal'|'vertical'} orientation - 主轴，默认 horizontal；横向接管左右键、纵向接管上下键，另一轴放行给页面
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写水平主轴上左右方向键的语义，默认 ltr
 * @attr {boolean} loop - 方向键到达末尾回绕，默认开启；写 loop="false" 关闭
 * @attr {boolean} disabled - 整条禁用：条目全部为 aria-disabled，方向键不再接管，「更多」菜单打不开
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：ghost 只组织控件不画面，outline 为附着式工具面，subtle 为淡底；默认 ghost
 * @attr {'sm'|'md'|'lg'} size - 尺寸：只影响条目间距与整条内边距，条目自身的大小归条目
 * @csspart root - role=toolbar 的容器（键盘在此收口，也是 roving tabindex 的兜底位）
 * @csspart group - role=group 的小分组，放置一组相关控件
 * @csspart item - 工具条条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"；只放图标时写 data-icon-only，宽等于高
 * @csspart separator - role=separator 分隔线，朝向恒与主轴垂直
 * @csspart overflow-trigger - 行尾的「更多」钮，写一个空 `<button>` 放在 root 末尾即可；放不下的条目收进它弹出的菜单，全部放得下时收着
 */
export class XhToolbarElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: toolbarAnatomy, meta: toolbarMeta }

  // 「更多」菜单里带图标的条目放一枚 xh-icon
  static override dependencies = { 'xh-icon': XhIconElement }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
    // 图标记录是对象，同样只走 property
    itemIcons: { attribute: false },
  }

  declare orientation?: Orientation
  declare direction?: Direction
  declare loop?: boolean
  declare disabled?: boolean
  declare variant?: ControlVariant
  declare size?: Size
  declare translations?: Partial<ToolbarTranslations>
  /** 条目的图标，键是条目的 value：收起进「更多」菜单的条目带着它，排在文字之前。条目自己（工具条上的那颗按钮）里放不放图标归作者。 */
  declare itemIcons?: Readonly<Record<string, IconRecord>>

  /** 条目的禁用声明：connect 每帧把 aria-disabled 写回条目，回读时要跳过这些写回值，只认作者写的。 */
  private readonly declaredDisabled = createDisabledDeclarations()

  private readonly ctrl = new MachineController<ToolbarSchema>(this, toolbarMachine, () => this.machineProps(), {
    // 收纳量测在机器的挂载效应里跑，root 的取值口要赶在那之前交出去
    onBuilt: svc => svc.refs.set('getRootEl', () => this.getPart('root')),
  })

  /** 「更多」菜单：菜单机器的 props 从工具条的机器现读，故必须排在 ctrl 之后建。 */
  private readonly overflowMenu = new OverflowMenuController(this, {
    name: 'Toolbar overflow menu',
    spreader: this.spreader,
    trigger: () => this.getPart('overflow-trigger'),
    props: () => toolbarOverflowMenuProps(this.ctrl.service as Service<ToolbarSchema>),
    createPortal: options => this.createAnchoredPortalController(options),
  })

  private machineProps(): Partial<ToolbarSchema['props']> {
    return {
      orientation: this.orientation,
      dir: this.direction,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect（loop 默认开、disabled 默认关）
      loop: this.loop,
      disabled: this.disabled,
      variant: this.variant,
      size: this.size,
      translations: this.translations,
      itemIcons: this.itemIcons,
    }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在条内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整条零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    // 拿着锚点的「更多」钮走了，同样没人认领 Tab 位
    if (context.get('overflowTriggerFocused') && nodes.some(el => el.getAttribute('data-part') === 'overflow-trigger')) {
      send({ type: 'TOOLBAR.BLUR' })
      return
    }
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，分组与分隔线离场不会误判；
    // 只有走的正是持有锚点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'TOOLBAR.BLUR' })
  }

  private itemProps(el: HTMLElement): ToolbarItemProps {
    return { value: el.getAttribute('value') ?? '', disabled: this.declaredDisabled.read(el) ?? false, iconOnly: el.hasAttribute('data-icon-only') }
  }

  protected wire(): void {
    const api = connectToolbar(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 分组与分隔线都是多实例 part，且属性与身份无关，逐个打同一份产出即可
    for (const el of this.getParts('group'))
      this.spreader.spread(el, api.getGroupProps() as Record<string, unknown>)
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // 条目逐个打：身份取作者写的 value，禁用取作者在条目上的声明。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item')) {
      this.spreader.spread(el, api.getItemProps(this.itemProps(el)) as Record<string, unknown>)
      this.declaredDisabled.commit(el)
    }

    // 「更多」钮与它弹出的菜单：钮是作者写的工具条部件，菜单那一套由共用的控制器自建
    this.overflowMenu.wire(api.getOverflowTriggerProps() as Record<string, unknown>)
  }

  override disconnectedCallback(): void {
    this.overflowMenu.disposePortal()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起；重连时按需重建
    this.overflowMenu.release()
  }
}
