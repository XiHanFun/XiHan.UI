import type { TextFieldSchema } from './text-field.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'

const { createMachine } = setup<TextFieldSchema>()

/** maxLength 是否给了个能用的上限；负数与非有限值按没给处理。 */
function hasLimit(maxLength: number | undefined): maxLength is number {
  return maxLength != null && Number.isFinite(maxLength) && maxLength >= 0
}

/**
 * 按 maxLength 截断。
 * 原生 maxlength 只拦从键盘敲进来这一路，作者调 setValue 或直接写 input.value 都绕得过去。
 */
export function clampToMaxLength(value: string, maxLength: number | undefined): string {
  if (!hasLimit(maxLength))
    return value
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

/** 已顶到上限：再敲一个字符也进不去。maxLength 为 0 时空串就已经到顶。 */
export function isAtLimit(value: string, maxLength: number | undefined): boolean {
  return hasLimit(maxLength) && value.length >= maxLength
}

export const textFieldMachine = createMachine({
  name: 'text-field',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里，受控/非受控在此收口，不需要 CONTROLLED.* 影子事件
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  // 只有一个状态，两条事件挂在根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canClear', actions: ['clearValue'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      // 三个条件缺一不可；已经是空串时清空是一次没有变化的写，会白白惊动 onValueChange
      canClear: ({ prop, context }) =>
        !!prop('clearable') && !prop('disabled') && !prop('readOnly') && context.get('value') !== '',
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', clampToMaxLength(e.value, prop('maxLength')))
      },
      clearValue: ({ context }) => {
        context.set('value', '')
      },
    },
  },
})
