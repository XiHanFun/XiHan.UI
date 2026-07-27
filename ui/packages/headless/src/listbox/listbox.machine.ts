import type { ListboxSchema, ListboxSelectionMode } from './listbox.types'
import { createTypeahead } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ListboxSchema>()

/**
 * 生效的选择模式。multiple 只是 selectionMode='multiple' 的简写，
 * 两者同时给时以 selectionMode 为准——它表达得更细（还能是 extended）。
 */
export function listboxSelectionMode(
  mode: ListboxSelectionMode | undefined,
  multiple: boolean | undefined,
): ListboxSelectionMode {
  return mode ?? (multiple ? 'multiple' : 'single')
}

/** 裸串是单选的简写，内部一律按数组处理；undefined 要原样透传，cell 靠它区分受控与否。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
}

/**
 * 选中集合的不变量：单选恒为长度 ≤ 1，复选去重。
 * 公开 API 与区间连选都经这里收口，免得造出 UI 自己造不出的选中集合。
 */
function normalizeSelection(next: readonly string[], mode: ListboxSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : [...new Set(next)]
}

/**
 * 数组按元素比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 归一成
 * 新数组，引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，onValueChange 便会重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 选中集合住在 context 的 cell 里，不编码进 FSM 状态：cell 本身就是受控/非受控的收口点
// （value 给定即受控，读直取 prop、写只发 onValueChange 不落内部值），
// 因此不需要影子事件与受控守卫。机器只有一个状态，逻辑全在 context + actions。
export const listboxMachine = createMachine({
  name: 'listbox',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点与区间起点都不受控、不对外通知：前者服务 roving tabindex 与方向键起点，
    // 后者只在 Shift 连选时用得上
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    anchorValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    typeahead: createTypeahead(),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'ITEM.SELECT': { actions: ['selectItem'] },
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    actions: {
      // 整体改写不动区间起点：Shift 连选正是靠起点钉住不动才能来回收窄
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, listboxSelectionMode(prop('selectionMode'), prop('multiple'))))
      },
      selectItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        context.set('value', [e.value])
        context.set('anchorValue', e.value)
        context.set('focusedValue', e.value)
      },
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const current = context.get('value')
        // 单选没有「取消选中」这回事：切换退化成选中，否则用户点两下就把列表点空了
        if (listboxSelectionMode(prop('selectionMode'), prop('multiple')) === 'single')
          context.set('value', [e.value])
        else
          context.set('value', current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value])
        context.set('anchorValue', e.value)
        context.set('focusedValue', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场只清焦点锚点，选中值与区间起点留着：下次焦点回来还要从它们起步
      clearFocusedValue: ({ context, refs }) => {
        context.set('focusedValue', null)
        // 焦点走了缓冲也得丢：否则下次进来第一个字母会被拼进上一轮的查询串
        refs.get('typeahead').clear()
      },
    },
  },
})
