/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sortable 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { DndDelta } from '@xihan-ui/pointer'
import type { SortableApi, SortableItemState, SortableSchema } from './sortable.types'
import { createPressTracker, dataAttr, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { sortableOffsets } from '@xihan-ui/pointer'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { sortableAnatomy } from './sortable.anatomy'

const parts = sortableAnatomy.build()

const ZERO: DndDelta = { x: 0, y: 0 }

/** 方向键的语义：往列表的后面去还是前面去。 */
function stepFromKey(key: string, axis: string, rtl: boolean): number | null {
  const vertical = axis === 'vertical'
  const both = axis === 'both'

  if (key === 'ArrowDown' && (vertical || both))
    return 1
  if (key === 'ArrowUp' && (vertical || both))
    return -1
  if (key === 'ArrowRight' && (!vertical || both))
    return rtl ? -1 : 1
  if (key === 'ArrowLeft' && (!vertical || both))
    return rtl ? 1 : -1
  return null
}

export function connectSortable<T extends PropTypes>(
  service: Service<SortableSchema>,
  normalize: NormalizeProps<T>,
): SortableApi<T> {
  const { context, prop, send, state } = service

  const ids = prop('ids') ?? []
  const disabled = !!prop('disabled')
  const axis = prop('orientation') ?? 'vertical'
  const rtl = prop('dir') === 'rtl'
  const translations = prop('translations')

  const dragging = state.matches('dragging')
  const activeId = context.get('activeId')
  const from = context.get('from')
  const to = context.get('to')
  const mode = context.get('mode')

  // 让位位移由几何层算，两条路径（指针 / 键盘）共用同一套规则
  const offsets = dragging
    ? sortableOffsets({
        rects: context.get('rects'),
        from,
        to,
        dragDelta: mode === 'pointer' ? context.get('delta') : undefined,
      })
    : []

  const items: SortableItemState[] = ids.map((id, index) => ({
    id,
    index,
    dragging: dragging && id === activeId,
    offset: offsets[index] ?? ZERO,
  }))

  const itemAt = (id: string): SortableItemState | undefined => items.find(item => item.id === id)

  // 按压通道：每个把手各自合成一份跟踪器，真源是机器 context 里「正被按住的那一项」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 把手的 pointerdown 同时是拖动起点：触屏那一下先进按压面，走够激活距离升级成拖动时由机器撤下
  const pressedId = context.get('pressedId')
  const press = (id: string, pressDisabled: boolean): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedId') === id,
    onChange: down => send(down ? { type: 'PRESS.START', id, disabled: pressDisabled } : { type: 'PRESS.END', id }),
  })

  /** 拖动中按下的键：方向键挪一格，空格 / 回车落下，Esc 取消。 */
  const onDragKeyDown = (event: KeyboardEvent): boolean => {
    if (event.key === 'Escape') {
      event.preventDefault()
      send({ type: 'KEY.CANCEL' })
      return true
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
      if (event.repeat)
        return true
      send({ type: 'KEY.DROP' })
      return true
    }
    // Tab 在拖动中拦下：焦点一旦移走，这一场就没有出口了
    if (event.key === 'Tab') {
      event.preventDefault()
      return true
    }
    const step = stepFromKey(event.key, axis, rtl)
    if (step != null) {
      event.preventDefault()
      send({ type: 'KEY.MOVE', step })
      return true
    }
    return false
  }

  return {
    dragging,
    activeId,
    from,
    to,
    mode,
    items,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'group',
      'aria-label': translations?.root ?? 'Sortable list',
      'data-orientation': axis,
      'data-disabled': dataAttr(disabled),
      'data-dragging': dataAttr(dragging),
    }),

    getItemProps: ({ id, disabled: itemDisabled }) => {
      const item = itemAt(id)
      const isDragging = !!item?.dragging
      const offset = item?.offset ?? ZERO
      const off = disabled || !!itemDisabled
      return normalize.element({
        ...parts.item.attrs,
        [ITEM_VALUE_ATTR]: id,
        'data-index': String(item?.index ?? -1),
        'data-dragging': dataAttr(isDragging),
        'data-disabled': dataAttr(off),
        'style': {
          transform: offset.x === 0 && offset.y === 0 ? undefined : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          // 被拖那一项要压在让位的项之上，否则跟手时会钻到别人底下
          zIndex: isDragging ? 1 : undefined,
        },
        // 不给手柄时整项可拖。手柄在项里面，它的 pointerdown 冒泡上来会再发一次，
        // 但那时已经进了 pending，重复的这条没有转移接它，因此是幂等的。
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (off || event.button !== 0)
            return
          // 这里刻意不 preventDefault：整项可拖时项里常有按钮与链接，
          // 拦掉默认行为会连它们的聚焦一起拦掉。拖起来之后由皮肤关掉选中
          send({
            type: 'ITEM.POINTER_DOWN',
            id,
            point: { clientX: event.clientX, clientY: event.clientY },
            pointerId: event.pointerId,
          })
        },
        // 键盘只认空格，且只在焦点落在项自身时响应：
        // 整项可拖的场景里，Enter 通常已经是这一项的主操作（导航 / 打开），
        // 项内部的按钮拿着焦点时也不该被当成拾起
        'onKeyDown': (event: KeyboardEvent) => {
          if (off || event.key !== ' ' || event.target !== event.currentTarget)
            return
          if (dragging) {
            onDragKeyDown(event)
            return
          }
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          send({ type: 'ITEM.PICKUP', id })
        },
      })
    },

    getItemDragTriggerProps: ({ id, disabled: itemDisabled }) => {
      const item = itemAt(id)
      const isDragging = !!item?.dragging
      const position = (item?.index ?? 0) + 1
      const name = translations?.item?.(id, position, ids.length) ?? id
      const off = disabled || !!itemDisabled
      const handlers = press(id, off)
      return normalize.element({
        ...parts['item-drag-trigger'].attrs,
        // 宿主是 <button> 时必须显式写 type：不写默认是 submit，放进表单里一按就提交
        'type': 'button',
        'role': 'button',
        'tabindex': off ? undefined : 0,
        'aria-label': translations?.itemDragTrigger?.(name) ?? `Reorder ${name}`,
        'aria-roledescription': 'sortable',
        'aria-disabled': off ? 'true' : 'false',
        'aria-pressed': isDragging ? 'true' : 'false',
        // 把手是只有字形的离散动作钮（定尺把手）：盒、悬停 / 按下与按压、粗指针热区、焦点环、禁用面由
        // Action Control 家族按这几位给。icon ghost 档静息透明、白底承载 hover 100 → pressed 200；
        // xs 是 24px 正方盒，与此前 --xh-control-action-size 同尺寸。禁用同时打 aria-disabled 与 data-disabled，
        // 家族按后者收掉反馈
        'data-xh-action-control': '',
        'data-xh-action-profile': 'icon',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': 'xs',
        'data-dragging': dataAttr(isDragging),
        'data-disabled': dataAttr(off),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；
        // 键盘那一下在 keydown 即拾起转拖动、随即撤下，触屏按住到走够激活距离之前看得见
        'data-pressed': dataAttr(pressedId === id),
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        // 不关掉这一轴的默认手势，触屏上手指一划就被系统收走（pointercancel）
        'style': { touchAction: off ? undefined : 'none' },
        'onPointerDown': (event: PointerEvent) => {
          // 触屏那一下先过跟踪器（鼠标 / 笔不走这一路），再照常起拖动会话
          handlers.onPointerDown(event)
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (off || event.button !== 0)
            return
          event.preventDefault()
          send({
            type: 'ITEM.POINTER_DOWN',
            id,
            point: { clientX: event.clientX, clientY: event.clientY },
            pointerId: event.pointerId,
          })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (off)
            return
          if (dragging) {
            onDragKeyDown(event)
            return
          }
          // 先过跟踪器再拾起：拾起转拖动那一下由机器撤下按压面
          handlers.onKeyDown(event)
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
            if (event.repeat)
              return
            send({ type: 'ITEM.PICKUP', id })
          }
        },
      })
    },

    /**
     * 落点线画在松手后这一项会插进去的那条缝上：往后挪落在目标项的后缘，往前挪落在它的前缘。
     * 起点钉在容器左上角、位移写 transform：矩形是屏幕坐标，换成逻辑属性会在 rtl 下落到另一头。
     * 四个键每帧都写全（用不上的写空串清掉）：WC 侧 Object.assign 到 style 上不会撤掉上一帧的旧键。
     */
    getDropIndicatorProps: () => {
      const rect = dragging ? context.get('rects')[to] : undefined
      const origin = context.get('rootOrigin')
      const active = !!rect && !!origin && from >= 0 && to !== from
      let offset = ''
      let blockSize = ''
      if (active && rect && origin) {
        const after = to > from
        if (axis === 'vertical') {
          offset = `translate3d(0, ${(after ? rect.y + rect.height : rect.y) - origin.y}px, 0)`
        }
        else {
          const x = (after ? rect.x + rect.width : rect.x) - origin.x
          // 换行网格里线只有目标那一格那么高，单轴横排则整条铺满容器（高度归皮肤）
          offset = axis === 'both'
            ? `translate3d(${x}px, ${rect.y - origin.y}px, 0)`
            : `translate3d(${x}px, 0, 0)`
          blockSize = axis === 'both' ? `${rect.height}px` : ''
        }
      }
      return normalize.element({
        ...parts['drop-indicator'].attrs,
        // 落点由播报区念给读屏，这条线只是同一件事的视觉形态
        'aria-hidden': true,
        'data-orientation': axis,
        'hidden': !active || undefined,
        'style': { left: '0px', top: '0px', transform: offset, blockSize },
      })
    },

    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'style': VISUALLY_HIDDEN_STYLE,
    }),
  }
}
