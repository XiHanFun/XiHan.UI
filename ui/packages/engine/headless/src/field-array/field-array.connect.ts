/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { FieldArrayApi, FieldArrayItem, FieldArrayItemProps, FieldArrayPressedKey, FieldArraySchema } from './field-array.types'
import { contains, createPressTracker, dataAttr } from '@xihan-ui/core'
import { formArrayItemPath } from '../form'
import { fieldArrayAnatomy, fieldArrayTriggerId } from './field-array.anatomy'
import { atRowMax, atRowMin, fieldArrayValue, rowBound } from './field-array.machine'

const parts = fieldArrayAnatomy.build()

/** 号还没对上这一帧的兜底 key，与机器发的 `row-<流水号>` 形状不同，不会撞上。 */
function fallbackKey(index: number): string {
  return `row@${index}`
}

export function connectFieldArray<T extends PropTypes>(
  service: Service<FieldArraySchema>,
  normalize: NormalizeProps<T>,
): FieldArrayApi<T> {
  const { context, prop, scope, send } = service

  const value = fieldArrayValue(service)
  const keys = context.get('keys')
  const count = value.length
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const name = prop('name')
  const movable = !!prop('movable')
  const min = rowBound(prop('min'))
  const max = rowBound(prop('max'))
  const atMin = atRowMin(count, min)
  const atMax = atRowMax(count, max)
  const empty = count === 0
  // 只读与禁用一样按不动行数，只是不置灰
  const editable = !disabled && !readOnly
  const canAdd = editable && !atMax

  // 三个行内把手都只装得下一个图形，行号只能由名字带出来；
  // 新增把手装的是一句话，名字取它自己的内容，这里不覆盖
  const translations = prop('translations')
  const label = {
    deleteItem: translations?.deleteItem ?? ((index: number, total: number) => `Remove row ${index} of ${total}`),
    moveUpTrigger: translations?.moveUpTrigger ?? ((index: number, total: number) => `Move row ${index} of ${total} up`),
    moveDownTrigger: translations?.moveDownTrigger ?? ((index: number, total: number) => `Move row ${index} of ${total} down`),
  }

  // 作者声明的下标可能指到列表外（行数刚变、声明还没跟上），一律按"这一行不在"处理
  const inRange = (index: number): boolean => Number.isInteger(index) && index >= 0 && index < count
  const canRemove = (index: number): boolean => editable && !atMin && inRange(index)
  const canMoveUp = (index: number): boolean => editable && movable && inRange(index) && index > 0
  const canMoveDown = (index: number): boolean => editable && movable && inRange(index) && index + 1 < count
  // 行内把手按行序号记按压：行换位后号跟着行走，按 index 记会在换序那一下认错把手
  const rowKey = (index: number): string => keys[index] ?? fallbackKey(index)

  // 按压通道：四类把手各自合成一份跟踪器，真源是机器 context 里「正被按住的那一个」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 把手用 aria-disabled 而非原生 disabled，按不动的那一下随 PRESS.START 带给守卫
  const pressed = context.get('pressed')
  const press = (key: FieldArrayPressedKey, pressDisabled: boolean): PressHandlers & { 'data-pressed': '' | undefined } => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressed') === key,
      onChange: down => send(down ? { type: 'PRESS.START', key, disabled: pressDisabled } : { type: 'PRESS.END', key }),
    })
    return {
      'data-pressed': dataAttr(pressed === key),
      'onKeyDown': handlers.onKeyDown,
      'onKeyUp': handlers.onKeyUp,
      'onBlur': handlers.onBlur,
      'onPointerDown': handlers.onPointerDown,
      'onPointerUp': handlers.onPointerUp,
      'onPointerCancel': handlers.onPointerCancel,
    }
  }

  /**
   * 本节点当下是不是正持有焦点。
   * 删完、挪完这个把手要么消失要么换位，据此决定要不要把焦点接回去；
   * 程序化调 api.remove / api.move 时没有把手参与，一律不动焦点。
   */
  const holdsFocus = (el: HTMLElement): boolean => {
    const active = scope.getActiveElement()
    return !!active && contains(el, active)
  }

  const items: FieldArrayItem[] = value.map((row, index) => ({
    index,
    key: keys[index] ?? fallbackKey(index),
    value: row,
    // 行里的控件靠它参与提交：显式数组路径保留每一段的类型，绝不拼 `name[index]` 字符串。
    name: name === undefined ? undefined : formArrayItemPath(name, index),
    first: index === 0,
    last: index + 1 === count,
    canRemove: canRemove(index),
    canMoveUp: canMoveUp(index),
    canMoveDown: canMoveDown(index),
  }))

  // 行下标落到行内每个部件上，皮肤与测试据此认出这是第几行
  const itemAttrs = (item: FieldArrayItemProps): Record<string, string | undefined> => ({
    'data-index': String(item.index),
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
    // 行数到没到上下限：行自己也拿得到，不必回头去问根
    'data-at-min': dataAttr(atMin),
    'data-at-max': dataAttr(atMax),
  })

  // 两颗换序把手只差方向；家族标记由各自的 getter 写在自己身上（门禁按 getter 切片判家族归属）
  const moveTriggerProps = (item: FieldArrayItemProps, step: -1 | 1, attrs: Record<string, unknown>): T['button'] => {
    const part = step < 0 ? 'move-up-trigger' : 'move-down-trigger'
    const enabled = step < 0 ? canMoveUp(item.index) : canMoveDown(item.index)
    const text = step < 0 ? label.moveUpTrigger : label.moveDownTrigger
    return normalize.button({
      ...parts[part].attrs,
      ...itemAttrs(item),
      ...attrs,
      'type': 'button',
      // 挪完由机器按这个 id 把焦点接到新位置上同方向的把手
      'id': fieldArrayTriggerId(scope, part, item.index),
      // 把手里通常只有一个箭头，不给名字读屏念不出这是在挪第几行
      'aria-label': text(item.index + 1, count),
      // 不换序时整对把手收起：留一对永远按不动的按钮只会占位
      'hidden': movable ? undefined : true,
      // 一律 aria-disabled 不用原生 disabled：原生 disabled 不派 click，禁用守卫就走不到
      'aria-disabled': enabled ? 'false' : 'true',
      'data-disabled': dataAttr(!enabled),
      'onClick': (event: MouseEvent) => {
        if (!enabled)
          return
        send({
          type: 'ITEM.MOVE',
          from: item.index,
          to: item.index + step,
          restoreFocus: holdsFocus(event.currentTarget as HTMLElement),
        })
      },
    })
  }

  return {
    value,
    items,
    count,
    empty,
    disabled,
    readOnly,
    invalid,
    movable,
    atMin,
    atMax,
    canAdd,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    add: () => send({ type: 'ITEM.ADD' }),
    remove: index => send({ type: 'ITEM.REMOVE', index }),
    move: (from, to) => send({ type: 'ITEM.MOVE', from, to }),
    moveUp: index => send({ type: 'ITEM.MOVE', from: index, to: index - 1 }),
    moveDown: index => send({ type: 'ITEM.MOVE', from: index, to: index + 1 }),

    // 根上不写 role：这一堆行是不是一个表单分组、叫什么名字，由作者按放进去的内容自己声明
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-at-min': dataAttr(atMin),
      'data-at-max': dataAttr(atMax),
      'data-movable': dataAttr(movable),
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemAttrs(item),
      'data-first': dataAttr(item.index === 0),
      'data-last': dataAttr(item.index + 1 === count),
    }),

    // 行前的行号或名目。纯标注：与行里的控件不建 for 关联，那一层的名字归作者
    getItemLabelProps: item => normalize.element({
      ...parts['item-label'].attrs,
      ...itemAttrs(item),
    }),

    getItemContentProps: item => normalize.element({
      ...parts['item-content'].attrs,
      ...itemAttrs(item),
    }),

    getItemActionProps: item => normalize.element({
      ...parts['item-action'].attrs,
      ...itemAttrs(item),
    }),

    getAddTriggerProps: () => normalize.button({
      ...parts['add-trigger'].attrs,
      // 新增把手是一颗带文案的离散动作钮：text 档、中性描边（虚线由皮肤给），高一个控件
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'type': 'button',
      // 整份删空后焦点交回这里，机器按这个 id 找它
      'id': fieldArrayTriggerId(scope, 'add-trigger'),
      // 到上限用 aria-disabled 而不是原生 disabled：原生 disabled 不派 click，
      // 禁用守卫就走不到；而且禁用元素持不住焦点，连按几下加到顶时键盘用户会当场丢焦点
      'aria-disabled': canAdd ? 'false' : 'true',
      'data-disabled': dataAttr(!canAdd),
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
      ...press('add', !canAdd),
      'onClick': () => {
        if (canAdd)
          send({ type: 'ITEM.ADD' })
      },
    }),

    // 行内三颗把手是只有字形的离散动作钮：盒、悬停 / 按下与 0.97 按压、粗指针热区、禁用面由 Action Control
    // 家族按这几位给。icon 档 xs 是 24px 正方盒——行级把手贴着一个控件高的行，取行内动作钮那一档；
    // ghost 档静息透明，白底承载 hover 100 → pressed 200
    getItemDeleteTriggerProps: item => normalize.button({
      ...parts['item-delete-trigger'].attrs,
      ...itemAttrs(item),
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      'type': 'button',
      // 删完由机器按这个 id 把焦点接到接位的那一行上
      'id': fieldArrayTriggerId(scope, 'item-delete-trigger', item.index),
      // 把手里通常只有一个叉，不给名字读屏念不出删的是第几行
      'aria-label': label.deleteItem(item.index + 1, count),
      // 同新增把手：到下限用 aria-disabled，原生 disabled 不派 click
      'aria-disabled': canRemove(item.index) ? 'false' : 'true',
      'data-disabled': dataAttr(!canRemove(item.index)),
      // Enter 在 keydown 即删掉这一行，把手随行离场后由机器松开
      ...press(`item-delete:${rowKey(item.index)}`, !canRemove(item.index)),
      'onClick': (event: MouseEvent) => {
        if (!canRemove(item.index))
          return
        send({
          type: 'ITEM.REMOVE',
          index: item.index,
          restoreFocus: holdsFocus(event.currentTarget as HTMLElement),
        })
      },
    }),

    // 两颗换序把手的按压也各自记：Enter 在 keydown 即换位，把手随行挪走后由机器松开
    getMoveUpTriggerProps: item => moveTriggerProps(item, -1, {
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press(`move-up:${rowKey(item.index)}`, !canMoveUp(item.index)),
    }),
    getMoveDownTriggerProps: item => moveTriggerProps(item, 1, {
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press(`move-down:${rowKey(item.index)}`, !canMoveDown(item.index)),
    }),
  }
}
