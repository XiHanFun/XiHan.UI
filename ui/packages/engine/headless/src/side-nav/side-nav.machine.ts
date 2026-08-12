import type { SideNavNode, SideNavSchema } from './side-nav.types'
import { setup } from '@xihan-ui/machine'
import { indexTree } from '../tree'

const { createMachine } = setup<SideNavSchema>()

/** 去重且保序：展开集合是一个集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/** 数组按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * 手风琴收口：展开某枝时收起同层其余分支，不同层与它的祖先不动。
 * 层级按父节点判：同父即同层。
 */
export function accordionSiblings(
  collection: readonly SideNavNode[],
  expanded: readonly string[],
  opening: string,
): string[] {
  const index = indexTree(collection)
  const parent = index.get(opening)?.parent ?? null
  return expanded.filter((value) => {
    if (value === opening)
      return true
    return (index.get(value)?.parent ?? null) !== parent
  })
}

// 选中、展开与焦点锚点都住在 context 的 cell 里，受控/非受控在 cell 收口；
// 没有浮层与副作用，单状态位。
export const sideNavMachine = createMachine({
  name: 'side-nav',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    expandedValue: cell<string[]>(() => {
      const controlled = prop('expandedValue')
      return {
        value: controlled ? [...controlled] : undefined,
        defaultValue: prop('defaultExpandedValue') ? unique(prop('defaultExpandedValue')!) : [],
        isEqual: sameValues,
        onChange: value => prop('onExpandedChange')?.({ value }),
      }
    }),
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'VALUE.SET': { guard: 'canChange', actions: ['setValue'] },
        'LINK.SELECT': { guard: 'canChange', actions: ['selectLink'] },
        'EXPANDED.SET': { guard: 'canChange', actions: ['setExpanded'] },
        'BRANCH.EXPAND': { guard: 'canChange', actions: ['expandBranch'] },
        'BRANCH.COLLAPSE': { guard: 'canChange', actions: ['collapseBranch'] },
        'BRANCH.TOGGLE': { guard: 'canChange', actions: ['toggleBranch'] },
        'NODE.FOCUS': { actions: ['setFocusedValue'] },
        'FOCUS.CLEAR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    guards: {
      canChange: ({ prop }) => !prop('disabled'),
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', e.value)
      },
      selectLink: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'LINK.SELECT')
          context.set('value', e.value)
      },
      setExpanded: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'EXPANDED.SET')
          context.set('expandedValue', unique(e.value))
      },
      expandBranch: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.EXPAND')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value))
          return
        const next = [...current, e.value]
        context.set(
          'expandedValue',
          prop('accordion') ? accordionSiblings(prop('collection') ?? [], next, e.value) : next,
        )
      },
      collapseBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'BRANCH.COLLAPSE')
          context.set('expandedValue', context.get('expandedValue').filter(v => v !== e.value))
      },
      toggleBranch: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.TOGGLE')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value)) {
          context.set('expandedValue', current.filter(v => v !== e.value))
          return
        }
        const next = [...current, e.value]
        context.set(
          'expandedValue',
          prop('accordion') ? accordionSiblings(prop('collection') ?? [], next, e.value) : next,
        )
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NODE.FOCUS')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
