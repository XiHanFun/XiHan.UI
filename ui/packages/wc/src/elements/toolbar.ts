import type { Direction, Orientation } from '@xihan-ui/core'
import type { ToolbarItemProps, ToolbarSchema } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectToolbar, toolbarMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 loop 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-toolbar>` —— Light-DOM 行为宿主：作者写 root、若干 item，可选的 group 与 separator，
 * 元素跑 toolbar 机器并把 connect 产出打上去。
 *
 * 工具条只管两件事：整条一个 Tab 位的方向键导航，以及 role=toolbar / role=group /
 * role=separator 这套 ARIA。条目自己是按钮、切换钮还是下拉触发器，各自的角色、按下态与
 * 点击行为一律归它自己——元素不覆盖条目的 role，也不接管条目的 click。
 * 条目身份取写在条目上的 value 属性；禁用由条目自报 aria-disabled
 * （集合条目一律如此，原生 disabled 不可聚焦、就当不成方向键的起点）。
 * 落在 form 里的按钮式条目记得自己写 type="button"，否则回车会直接提交表单。
 *
 * 导航在事件那一刻按 data-scope+data-part 查活 DOM，依赖 connect 回写的 data-value，
 * 因此 wire 必须先于交互跑过（基类 updated 已保证）。
 *
 * @customElement xh-toolbar
 * @attr {'horizontal'|'vertical'} orientation - 主轴，默认 horizontal；横排收左右键、竖排收上下键，另一轴放行给页面
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写水平主轴上左右方向键的语义，默认 ltr
 * @attr {boolean} loop - 方向键走到尽头回绕，默认开启；写 loop="false" 关掉
 * @attr {boolean} disabled - 整条禁用：条目全转 aria-disabled，方向键不再接管
 * @csspart root - role=toolbar 的容器（键盘在此收口，也是 roving tabindex 的兜底位）
 * @csspart group - role=group 的小分组，装一串相关控件
 * @csspart item - 工具条条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart separator - role=separator 分隔线，朝向恒与主轴垂直
 */
export class XhToolbarElement extends XhElement {
  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
  }

  declare orientation?: Orientation
  declare direction?: Direction
  declare loop?: boolean
  declare disabled?: boolean

  // 整条禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整条禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整条禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasToolbarDisabled = false

  // toolbar 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<ToolbarSchema>(this, toolbarMachine, () => this.machineProps())

  private machineProps(): Partial<ToolbarSchema['props']> {
    return {
      orientation: this.orientation,
      dir: this.direction,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect（loop 默认开、disabled 默认关）
      loop: this.loop,
      disabled: this.disabled,
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
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，分组与分隔线离场不会误判；
    // 只有走的正是持有锚点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'TOOLBAR.BLUR' })
  }

  private itemProps(el: HTMLElement): ToolbarItemProps {
    const value = el.getAttribute('value') ?? ''
    // 只有「本帧与上一帧都没整条禁用」时，节点上的 aria-disabled 才等于作者声明：
    // 整条禁用那几帧 connect 把每个条目都写成了 true，解禁当帧 DOM 上还留着这些写回值，
    // 此刻现读会把机器自己的产物误当声明、条目再也解不开。
    // 头一回见到这个条目时，DOM 上还只有作者写的东西（本帧的写回尚未发生），
    // 此刻无论整条禁没禁用都记得下真声明。少了这一条，「挂载那刻就整条禁用」
    // 会一路没有快照，解禁时退回现读、读到机器自己写的 true，整条就此永久锁死。
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    if (!this.disabled && !this.wasToolbarDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整条禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
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

    // 条目逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps(this.itemProps(el)) as Record<string, unknown>)

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasToolbarDisabled = !!this.disabled
  }
}
