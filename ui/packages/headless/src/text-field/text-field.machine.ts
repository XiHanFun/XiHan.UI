import type { TextFieldSchema } from './text-field.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TextFieldSchema>()

/** maxLength 是否给了个能用的上限。负数与非有限值按"没给"处理，与浏览器对 maxlength 的态度一致。 */
function hasLimit(maxLength: number | undefined): maxLength is number {
  return maxLength != null && Number.isFinite(maxLength) && maxLength >= 0
}

/**
 * 按 maxLength 截断。
 *
 * 原生 maxlength 只拦住"从键盘敲进来"这一路：作者调 setValue、以及自动化直接写
 * input.value 再派 input 事件，都绕得过去。上限若只写在属性上，超长值照样能落进状态，
 * data-at-limit 与字数提示就此开始说谎。
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
    // 值住在 cell 里：受控（给了 value）与非受控的收口点就是它，
    // 因此不需要 CONTROLLED.* 影子事件，也不必在 watch 里守 undefined
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  // 只有一个状态，两条事件挂在根级：写进状态里读起来像"这个状态才收"，会误导后来人
  on: {
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canClear', actions: ['clearValue'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      // 三个条件缺一不可：没开 clearable 时清空按钮本就该收起来，
      // 已经是空串时清空是一次没有变化的写（会白白惊动 onValueChange 的调用方）
      canClear: ({ prop, context }) =>
        !!prop('clearable') && !prop('disabled') && !prop('readOnly') && context.get('value') !== '',
    },
    actions: {
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
