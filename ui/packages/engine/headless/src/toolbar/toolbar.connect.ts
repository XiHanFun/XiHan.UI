/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { NormalizeProps, Orientation, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { ToolbarApi, ToolbarItemProps, ToolbarSchema } from './toolbar.types'
import { contains, createPressTracker, dataAttr, focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, stepIndex } from '@xihan-ui/core'
import { toolbarAnatomy, toolbarItemQuery } from './toolbar.anatomy'
import { toolbarOverflowTrigger } from './toolbar.overflow'

const parts = toolbarAnatomy.build()

export function connectToolbar<T extends PropTypes>(
  service: Service<ToolbarSchema>,
  normalize: NormalizeProps<T>,
): ToolbarApi<T> {
  const { context, prop, send } = service
  const focusedValue = context.get('focusedValue') ?? null
  const overflowTriggerFocused = context.get('overflowTriggerFocused')
  const overflowItems = context.get('overflowItems')
  const toolbarDisabled = !!prop('disabled')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const loop = prop('loop') ?? true
  const overflowTriggerLabel = prop('translations')?.overflowTrigger ?? 'More'

  // 分隔线恒与主轴垂直：横排工具条里分隔的是左右两段，那条线是竖的。
  const separatorOrientation: Orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'

  // 整条禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: ToolbarItemProps): boolean => toolbarDisabled || !!item.disabled

  // 收进「更多」菜单的条目：藏起来、让出 Tab 位，方向键跳过它们
  const collapsed = new Set(overflowItems.map(item => item.value))

  // 按压通道：每个条目各自合成一份跟踪器，真源是机器 context 里「正被按住的那个」的 value；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 条目是 aria-disabled（仍可聚焦、仍派事件），禁用事实随 PRESS.START 带给机器的守卫
  const pressedValue = context.get('pressedValue')
  const press = (item: ToolbarItemProps): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === item.value,
    onChange: down => send(down
      ? { type: 'PRESS.START', value: item.value, disabled: isDisabled(item) }
      : { type: 'PRESS.END', value: item.value }),
  })

  /**
   * 方向键走过的停靠点，文档序：露在外面的条目，末尾接「更多」钮（放不下时它才露面）。
   * 藏着的节点（收进菜单的条目、作者自己藏的条目、收着的「更多」钮）都不算。
   * 只在事件处理器里查活 DOM：connect 在 Vue 的 render 期求值，此时 DOM 尚不存在。
   */
  const stops = (container: HTMLElement): HTMLElement[] => {
    const list = queryItems(container, toolbarItemQuery).filter(el => !el.hidden)
    const trigger = toolbarOverflowTrigger(container)
    return trigger && !trigger.hidden ? [...list, trigger] : list
  }

  /** 锚点在停靠点里的位置：「更多」钮拿着焦点时是它，否则按条目的身份值找。 */
  const anchorIndex = (list: readonly HTMLElement[], trigger: HTMLElement | null): number =>
    overflowTriggerFocused
      ? list.findIndex(el => el === trigger)
      : list.findIndex(el => el !== trigger && itemValue(el) === focusedValue)

  /** 把焦点交给停靠点，锚点随之移过去。 */
  const land = (target: HTMLElement, trigger: HTMLElement | null): void => {
    focusItem(target)
    if (target === trigger) {
      send({ type: 'OVERFLOW_TRIGGER.FOCUS' })
      return
    }
    const next = itemValue(target)
    if (next != null)
      send({ type: 'ITEM.FOCUS', value: next })
  }

  /**
   * 方向键落点：起点用锚点，终点用事件那一刻的活 DOM 算。
   * axis 取 orientation：另一轴的方向键放行给页面滚动与读屏。
   * 返回 null 表示这个键不归导航管，此时绝不 preventDefault；带修饰键的组合一律返回 null。
   */
  const navigate = (container: HTMLElement, event: KeyboardEvent): void => {
    const intent = navIntentFromKey(event, { axis: orientation, dir })
    if (!intent)
      return
    event.preventDefault()
    const list = stops(container)
    const trigger = toolbarOverflowTrigger(container)
    // 禁用条目自动跳过，但它仍能当起点
    const next = stepIndex(list.length, anchorIndex(list, trigger), intent, { loop, skip: i => isItemDisabled(list[i]!) })
    if (next >= 0)
      land(list[next]!, trigger)
  }

  return {
    focusedValue,
    orientation,
    separatorOrientation,
    disabled: toolbarDisabled,
    overflowItems,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'toolbar',
      // toolbar 收 aria-orientation，读屏据此播报朝向并决定念哪一对方向键
      'aria-orientation': orientation,
      'aria-disabled': toolbarDisabled ? 'true' : 'false',
      'data-orientation': orientation,
      'data-variant': prop('variant') ?? 'ghost',
      'data-size': prop('size'),
      'data-disabled': dataAttr(toolbarDisabled),
      // 焦点在工具条外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用锚点在不在而非锚点指着谁：锚点可能指向已被删掉的条目，那时无人认领 tabindex=0。
      // 焦点已在条内时容器让位（-1），Tab 才能正常离开本条。
      // 整条禁用时不给兜底：转投取不到条目、方向键也一概不响应，留下的就是个什么都不通的 Tab 停靠点。
      'tabindex': toolbarDisabled ? undefined : (focusedValue == null && !overflowTriggerFocused ? 0 : -1),
      // 键盘全在 root 上收口，条目只管声明自己。
      // 条目自己处理过的键（菜单触发器用上下键展开菜单）已经 preventDefault，工具条只认没人认领的方向键
      'onKeyDown': (event: KeyboardEvent) => {
        if (toolbarDisabled || event.defaultPrevented)
          return
        navigate(event.currentTarget as HTMLElement, event)
      },
      'onFocus': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        // 只接管从条外进来的焦点：条内 Shift+Tab 往外退时转投会把人困在工具条里
        if (contains(container, event.relatedTarget as Node | null))
          return
        const list = stops(container)
        const trigger = toolbarOverflowTrigger(container)
        // 转投给锚点；锚点悬空、已禁用或已收进菜单时退回首个可停留的停靠点。
        // 整条禁用时两路都取不到，焦点留在容器上
        const anchored = list[anchorIndex(list, trigger)]
        focusItem(anchored && !isItemDisabled(anchored) ? anchored : navigateItems(list, null, 'first', { loop }))
      },
      'onFocusOut': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        if (contains(container, event.relatedTarget as Node | null))
          return
        send({ type: 'TOOLBAR.BLUR' })
      },
    }),

    // 一组相关控件的中性容器。
    // role=group 不收 aria-orientation，给了是无效 ARIA，排布信息只走 data-orientation
    getGroupProps: () => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      'data-orientation': orientation,
      'data-disabled': dataAttr(toolbarDisabled),
    }),

    // 不给 role、也不接管 click：条目的角色、按下态与点击行为归它自己。
    // 这里只发与导航相关的三样：身份标记、Tab 停靠位、禁用声明，外加家族标记——
    // 默认条目是一枚定尺工具按钮，接 Action Control 的 text 档，ghost 形态，档位随工具条 size 走；
    // 承载面的阶梯由根按 variant / 分组经 host 槽下发
    getItemProps: (item) => {
      const handlers = press(item)
      return normalize.element({
        ...parts.item.attrs,
        // 导航以此为条目身份
        [ITEM_VALUE_ATTR]: item.value,
        'data-xh-action-control': '',
        'data-xh-action-profile': 'text',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': prop('size') ?? 'md',
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
        'aria-disabled': isDisabled(item) ? 'true' : 'false',
        'data-disabled': dataAttr(isDisabled(item)),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；与焦点锚点互相独立
        'data-pressed': dataAttr(pressedValue === item.value),
        // 放不下、收进「更多」菜单：藏起来，由菜单里的那一项代为触发。
        // 没收起时不写：作者自己写在条目上的 hidden 照样生效
        'hidden': collapsed.has(item.value) || undefined,
        // roving tabindex：整条只有锚点条目留在 Tab 序列内
        'tabindex': focusedValue === item.value && !overflowTriggerFocused ? 0 : -1,
        // 禁用条目被点到也记锚点，方向键才知道从哪儿起步；这里只记锚点、不接管激活
        'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
        // 按压只记事实、不拦键：激活语义归条目自己（原生 button 的 click），方向键归 root
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'role': 'separator',
      // 显式写出朝向而不是省略成默认的 horizontal
      'aria-orientation': separatorOrientation,
      // 样式层要画的是这条线自己的朝向（横排工具条里是竖线），与 root 的 data-orientation 相反
      'data-orientation': separatorOrientation,
    }),

    // 行尾一枚单图标钮：Action Control icon 档、ghost 形态，与条目同档。
    // 全部放得下时收着；放不下时露面，它弹出的菜单里就是收起的那几个条目。
    // 它是 roving 的最后一站；横排时上下键归菜单触发器（展开菜单），竖排时上下键是工具条的主轴，
    // 在这里先接住走位并 preventDefault，菜单触发器随后见到已处理过的键就不再展开
    getOverflowTriggerProps: () => normalize.button({
      ...parts['overflow-trigger'].attrs,
      'type': 'button',
      'aria-label': overflowTriggerLabel,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'aria-disabled': toolbarDisabled ? 'true' : 'false',
      'data-disabled': dataAttr(toolbarDisabled),
      'hidden': overflowItems.length === 0 || undefined,
      'tabindex': overflowTriggerFocused ? 0 : -1,
      'onFocus': () => send({ type: 'OVERFLOW_TRIGGER.FOCUS' }),
      'onKeyDown': (event: KeyboardEvent) => {
        if (orientation !== 'vertical' || toolbarDisabled)
          return
        const container = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
        if (container)
          navigate(container, event)
      },
    }),
  }
}
