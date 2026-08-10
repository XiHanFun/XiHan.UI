import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { DynamicInputApi, DynamicInputItem, DynamicInputItemProps, DynamicInputSchema } from './dynamic-input.types'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { dynamicInputAnatomy, dynamicInputTriggerId } from './dynamic-input.anatomy'
import { atRowMax, atRowMin, rowBound } from './dynamic-input.machine'

const parts = dynamicInputAnatomy.build()

/** 号还没对上这一帧的兜底 key，与机器发的 `row-<流水号>` 形状不同，不会撞上。 */
function fallbackKey(index: number): string {
  return `row@${index}`
}

export function connectDynamicInput<T extends PropTypes>(
  service: Service<DynamicInputSchema>,
  normalize: NormalizeProps<T>,
): DynamicInputApi<T> {
  const { context, prop, scope, send } = service

  const value = context.get('value')
  const keys = context.get('keys')
  const count = value.length
  const disabled = !!prop('disabled')
  const movable = !!prop('movable')
  const min = rowBound(prop('min'))
  const max = rowBound(prop('max'))
  const atMin = atRowMin(count, min)
  const atMax = atRowMax(count, max)
  const empty = count === 0
  const canAdd = !disabled && !atMax

  // 三个行内把手都只装得下一个图形，行号只能由名字带出来；
  // 新增把手装的是一句话，名字取它自己的内容，这里不覆盖
  const translations = prop('translations')
  const label = {
    removeTrigger: translations?.removeTrigger ?? ((index: number, total: number) => `Remove row ${index} of ${total}`),
    moveUpTrigger: translations?.moveUpTrigger ?? ((index: number, total: number) => `Move row ${index} of ${total} up`),
    moveDownTrigger: translations?.moveDownTrigger ?? ((index: number, total: number) => `Move row ${index} of ${total} down`),
  }

  // 作者声明的下标可能指到列表外（行数刚变、声明还没跟上），一律按"这一行不在"处理
  const inRange = (index: number): boolean => Number.isInteger(index) && index >= 0 && index < count
  const canRemove = (index: number): boolean => !disabled && !atMin && inRange(index)
  const canMoveUp = (index: number): boolean => !disabled && movable && inRange(index) && index > 0
  const canMoveDown = (index: number): boolean => !disabled && movable && inRange(index) && index + 1 < count

  /**
   * 本节点当下是不是正持有焦点。
   * 删完、挪完这个把手要么消失要么换位，据此决定要不要把焦点接回去；
   * 程序化调 api.remove / api.move 时没有把手参与，一律不动焦点。
   */
  const holdsFocus = (el: HTMLElement): boolean => {
    const active = scope.getActiveElement()
    return !!active && contains(el, active)
  }

  const items: DynamicInputItem[] = value.map((row, index) => ({
    index,
    key: keys[index] ?? fallbackKey(index),
    value: row,
    first: index === 0,
    last: index + 1 === count,
    canRemove: canRemove(index),
    canMoveUp: canMoveUp(index),
    canMoveDown: canMoveDown(index),
  }))

  // 行下标落到行内每个部件上，皮肤与测试据此认出这是第几行
  const itemAttrs = (item: DynamicInputItemProps): Record<string, string | undefined> => ({
    'data-index': String(item.index),
    'data-disabled': dataAttr(disabled),
  })

  const moveTriggerProps = (item: DynamicInputItemProps, step: -1 | 1): T['button'] => {
    const part = step < 0 ? 'move-up-trigger' : 'move-down-trigger'
    const enabled = step < 0 ? canMoveUp(item.index) : canMoveDown(item.index)
    const text = step < 0 ? label.moveUpTrigger : label.moveDownTrigger
    return normalize.button({
      ...parts[part].attrs,
      ...itemAttrs(item),
      'type': 'button',
      // 挪完由机器按这个 id 把焦点接到新位置上同方向的把手
      'id': dynamicInputTriggerId(scope, part, item.index),
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
      'type': 'button',
      // 整份删空后焦点交回这里，机器按这个 id 找它
      'id': dynamicInputTriggerId(scope, 'add-trigger'),
      // 到上限用 aria-disabled 而不是原生 disabled：原生 disabled 不派 click，
      // 禁用守卫就走不到；而且禁用元素持不住焦点，连按几下加到顶时键盘用户会当场丢焦点
      'aria-disabled': canAdd ? 'false' : 'true',
      'data-disabled': dataAttr(!canAdd),
      'onClick': () => {
        if (canAdd)
          send({ type: 'ITEM.ADD' })
      },
    }),

    getRemoveTriggerProps: item => normalize.button({
      ...parts['remove-trigger'].attrs,
      ...itemAttrs(item),
      'type': 'button',
      // 删完由机器按这个 id 把焦点接到接位的那一行上
      'id': dynamicInputTriggerId(scope, 'remove-trigger', item.index),
      // 把手里通常只有一个叉，不给名字读屏念不出删的是第几行
      'aria-label': label.removeTrigger(item.index + 1, count),
      // 同新增把手：到下限用 aria-disabled，原生 disabled 不派 click
      'aria-disabled': canRemove(item.index) ? 'false' : 'true',
      'data-disabled': dataAttr(!canRemove(item.index)),
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

    getMoveUpTriggerProps: item => moveTriggerProps(item, -1),
    getMoveDownTriggerProps: item => moveTriggerProps(item, 1),
  }
}
