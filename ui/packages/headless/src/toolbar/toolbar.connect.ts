import type { NormalizeProps, Orientation, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ToolbarApi, ToolbarItemProps, ToolbarSchema } from './toolbar.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { toolbarAnatomy, toolbarItemQuery } from './toolbar.anatomy'

const parts = toolbarAnatomy.build()

export function connectToolbar<T extends PropTypes>(
  service: Service<ToolbarSchema>,
  normalize: NormalizeProps<T>,
): ToolbarApi<T> {
  const { context, prop, send } = service
  const focusedValue = context.get('focusedValue') ?? null
  const toolbarDisabled = !!prop('disabled')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const loop = prop('loop') ?? true

  // 分隔线恒与主轴垂直：横排工具条里分隔的是左右两段，那条线是竖的。
  const separatorOrientation: Orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'

  // 整条禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: ToolbarItemProps): boolean => toolbarDisabled || !!item.disabled

  /**
   * 条目集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序，
   * 分组里的条目与直接挂在 root 下的条目排在同一条链上。
   * 渲染期不得调用——那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
   */
  const items = (container: HTMLElement): HTMLElement[] => queryItems(container, toolbarItemQuery)

  /**
   * 方向键落点：起点用锚点（作者声明的值），终点用事件那一刻的活 DOM 算。
   *
   * axis 取 orientation 而不是 'both'：工具条是一维的，横排里的上下键该留给页面滚动与读屏，
   * 竖排里的左右键同理。返回 null 表示这个键不归导航管，此时绝不 preventDefault。
   * 带 Ctrl/Meta/Alt/Shift 的组合也一律返回 null（Ctrl+Home 之类归浏览器）。
   */
  const navigate = (container: HTMLElement, event: KeyboardEvent): void => {
    const intent = navIntentFromKey(event, { axis: orientation, dir })
    if (!intent)
      return
    event.preventDefault()
    // 禁用条目自动跳过（navigateItems 默认不停留在 aria-disabled 上），但它仍能当起点
    const target = navigateItems(items(container), focusedValue, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  return {
    focusedValue,
    orientation,
    separatorOrientation,
    disabled: toolbarDisabled,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'toolbar',
      // toolbar 收 aria-orientation（它继承自 group 却额外支持这一条），
      // 读屏据此播报"横向工具条，共 N 项"，也据此决定念哪一对方向键
      'aria-orientation': orientation,
      'aria-disabled': toolbarDisabled ? 'true' : 'false',
      'data-orientation': orientation,
      'data-disabled': dataAttr(toolbarDisabled),
      // 焦点在工具条外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非"锚点"本身：锚点可能指向一个已被删掉的条目，
      // 那时没有任何条目认领 tabindex=0，容器再一让位，整条对键盘用户永久不可达。
      // 焦点已在条内时容器让位（-1），Tab 才能正常离开本条。
      'tabindex': focusedValue == null ? 0 : -1,
      // 键盘全在 root 上收口：条目只管声明自己，一次冒泡一个处理器。
      // 条目自己的键（按钮的 Enter/Space、下拉触发器的 ArrowDown 展开）不归这里管，
      // 它们各自 stopPropagation 或由平台处理，工具条只认没人认领的方向键
      'onKeyDown': (event: KeyboardEvent) => {
        if (toolbarDisabled)
          return
        navigate(event.currentTarget as HTMLElement, event)
      },
      'onFocus': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        // 只接管从条外进来的焦点：条内 Shift+Tab 往外退时转投会把人困在工具条里
        if (contains(container, event.relatedTarget as Node | null))
          return
        const list = items(container)
        // 转投给锚点条目，兑现 tabindex=0 的承诺；锚点悬空或已禁用时退回首个可停留条目
        // ——这就是"锚点 = focusedValue ?? 第一个可用项"里后半句的落点。
        // 整条禁用时两路都取不到（每个条目都是 aria-disabled），焦点就留在容器上
        const target = list.find(el => itemValue(el) === focusedValue && !isItemDisabled(el))
          ?? navigateItems(list, null, 'first', { loop })
        focusItem(target)
      },
      'onFocusOut': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        if (contains(container, event.relatedTarget as Node | null))
          return
        send({ type: 'TOOLBAR.BLUR' })
      },
    }),

    // 一组相关控件（一串对齐方式、一串缩放按钮）的中性容器。
    // role=group 不收 aria-orientation（不在它的支持列表里），给了就是无效 ARIA，
    // 排布信息只走 data-orientation
    getGroupProps: () => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      'data-orientation': orientation,
      'data-disabled': dataAttr(toolbarDisabled),
    }),

    // 刻意不给 role、也不接管 click：条目是作者自己的控件（按钮、切换钮、下拉触发器），
    // 它的角色、按下态与点击行为归它自己，工具条盖上去只会把两套语义搅在一起。
    // 这里只发三样与导航直接相关的东西：身份标记、Tab 停靠位、禁用声明
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      // 导航以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用条目就再也当不成方向键的起点，样式与行为也会就此分裂
      'aria-disabled': isDisabled(item) ? 'true' : 'false',
      'data-disabled': dataAttr(isDisabled(item)),
      // roving tabindex：整条只有锚点条目留在 Tab 序列内
      'tabindex': focusedValue === item.value ? 0 : -1,
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步。
      // 这里只记锚点、不接管激活——条目点了要干什么是它自己的事
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
    }),

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'role': 'separator',
      // 显式写出朝向而不是省略成默认的 horizontal：分隔线与主轴垂直是个可断言的事实，
      // 省略等于让读屏与测试各自去猜默认值
      'aria-orientation': separatorOrientation,
      // 样式层要画的是这条线自己的朝向（横排工具条里是竖线），与 root 的 data-orientation 相反
      'data-orientation': separatorOrientation,
    }),
  }
}
