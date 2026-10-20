import type { StepWithExpect } from '../../conformance/types'

/**
 * 子菜单那一层的勾选与单选状态：条目按 value 在整页里找、逐个比对 aria-checked。
 * 子层的条目归子菜单那台机器（scope 是 menu），定位层在三端搬进 portal 的时机也不同，部件引用与文档序都对不上，
 * 这里只看每一条自己的状态；子层按数据异步铺好之前多等几轮。
 */
export function nestedChoiceState(expected: Readonly<Record<string, 'true' | 'false'>>): StepWithExpect {
  return {
    kind: 'raw',
    why: '子层的条目归子菜单那台机器，部件引用只认本组件的 scope；按 value 在整页里找',
    run: async ({ doc, flush }) => {
      const read = (): Record<string, string | null> => Object.fromEntries(Object.keys(expected).map(value => [
        value,
        doc.querySelector(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)?.getAttribute('aria-checked') ?? null,
      ]))
      let actual = read()
      for (let round = 0; round < 10 && Object.entries(expected).some(([value, checked]) => actual[value] !== checked); round++) {
        await flush()
        actual = read()
      }
      if (Object.entries(expected).some(([value, checked]) => actual[value] !== checked))
        throw new Error(`子层的勾选与单选：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
    },
  }
}

/**
 * 按 value 把焦点交给那条子菜单入口：子层的定位层搬进 portal 的时机三端不同，同一组件的条目文档序对不齐，
 * 部件下标会指到子层里的条目上；铺好之前多等几轮。
 */
export function focusByValue(scope: string, value: string): StepWithExpect {
  return {
    kind: 'raw',
    why: '子层的定位层搬进 portal 的时机三端不同，条目的文档序对不齐，按 value 找子菜单入口',
    run: async ({ doc, flush }) => {
      for (let round = 0; round < 10; round++) {
        const el = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-value="${value}"]`)
        if (el) {
          el.focus()
          await flush()
          return
        }
        await flush()
      }
      throw new Error(`找不到 ${scope} 里 value 为 ${value} 的条目`)
    },
  }
}

/** 子层的数据：两条勾选（写了 closeOnSelect）、一组单选。 */
export const NESTED_CHOICE_CHILDREN = [
  { value: 'outline', label: '页面结构', kind: 'checkbox', closeOnSelect: true },
  { value: 'history', label: '历史记录', kind: 'checkbox', closeOnSelect: true },
  { value: 'comfortable', label: '宽松', kind: 'radio', group: 'density', separatorBefore: true },
  { value: 'compact', label: '紧凑', kind: 'radio', group: 'density' },
] as const

/** 一条带子菜单的条目：子层的勾选与单选值写在它身上。 */
export function nestedChoiceItem(checkboxValue: readonly string[], density: string): Record<string, unknown> {
  return {
    value: 'panels',
    label: '面板',
    checkboxValue: [...checkboxValue],
    radioValue: { density },
    children: NESTED_CHOICE_CHILDREN.map(node => ({ ...node })),
  }
}
