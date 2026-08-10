import type { ToggleGroupSchema, ToggleGroupValue } from './toggle-group.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ToggleGroupSchema>()

/**
 * 作者那一侧的值形态归一成内部统一的数组。
 * 返回 undefined 只有一个来源：入参本身是 undefined，那是非受控的唯一表达，
 * 归一成空数组会变成受控且当前无选中。
 */
export function normalizeToggleGroupValue(
  input: ToggleGroupValue | undefined,
  multiple: boolean,
): string[] | undefined {
  if (input === undefined)
    return undefined
  if (input === null)
    return []
  const list = typeof input === 'string' ? [input] : [...input]
  // 去重：同一个值出现两次时点一下只摘掉一份，条目看着仍是选中的
  const unique = [...new Set(list)]
  // 单选只留第一个：多出来的那几个既报不出去也点不掉
  return multiple ? unique : unique.slice(0, 1)
}

/** 内部数组变回作者那一侧的形态：多选给数组，单选给单值（无选中为 null）。 */
export function toToggleGroupChangeValue(
  values: readonly string[],
  multiple: boolean,
): string | string[] | null {
  return multiple ? [...values] : (values[0] ?? null)
}

/**
 * 值按内容比，不按引用比：归一化每次都产出新数组，
 * cell 默认的 Object.is 会让版本号每读一次就涨一次、值没变也照发回调。
 */
export function sameToggleGroupValue(a: readonly string[], b: readonly string[] | undefined): boolean {
  return b != null && a.length === b.length && a.every((v, i) => v === b[i])
}

// 选中集合住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
// 机器只有一个状态，transition 省略 target 即只跑 actions、不换状态。
export const toggleGroupMachine = createMachine({
  name: 'toggle-group',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => {
      const multiple = !!prop('multiple')
      return {
        value: normalizeToggleGroupValue(prop('value'), multiple),
        defaultValue: normalizeToggleGroupValue(prop('defaultValue'), multiple) ?? [],
        isEqual: sameToggleGroupValue,
        onChange: values => prop('onValueChange')?.({ value: toToggleGroupChangeValue(values, multiple) }),
      }
    }),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        // 激活顺带把锚点搬过来，下次 Tab 进组落在刚点过的那个条目上
        'ITEM.TOGGLE': { actions: ['toggleItem', 'setFocusedValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'GROUP.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    actions: {
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        const next = normalizeToggleGroupValue(e.value, !!prop('multiple')) ?? []
        // 公开 API 不得造出界面造不出的值：disallowEmpty 下清空同样不认
        if (!next.length && prop('disallowEmpty'))
          return
        context.set('value', next)
      },
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const current = context.get('value')
        const next = current.includes(e.value)
          ? current.filter(v => v !== e.value)
          // 单选选中一项即挤掉其余，集合恒为长度 1
          : (prop('multiple') ? [...current, e.value] : [e.value])
        // disallowEmpty：最后一个选中项点不掉，值恒非空
        if (!next.length && prop('disallowEmpty'))
          return
        context.set('value', next)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.TOGGLE' || e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
