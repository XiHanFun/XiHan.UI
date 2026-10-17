// 字段控件补齐的 readOnly / invalid / required：放进 XhField 时自动继承，实例显式给的值优先；
// ARIA 落在支持它的那个角色上，axe 不报属性与角色问题。
import type { ReactNode } from 'react'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhColorPickerControl,
  XhColorPickerRoot,
  XhColorPickerTrigger,
  XhColorPickerValueText,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingRoot,
  XhToggleGroupRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Axis = 'readOnly' | 'invalid' | 'required'
type State = Partial<Record<Axis, boolean>>

interface Case {
  name: string
  /** 这一笔补上的轴，以及每条轴在承载节点上写的属性。 */
  axes: Partial<Record<Axis, string>>
  render: (state: State) => ReactNode
  /** 承载状态的那个节点。 */
  host: (root: HTMLElement) => HTMLElement
  /** 承载节点另接字段的标签与描述链（按钮这类不收 aria-required 的控件走组类接线）。 */
  wired?: boolean
}

const CASES: Case[] = [
  {
    name: 'rating',
    axes: { invalid: 'aria-invalid' },
    render: state => <XhRatingRoot count={3} {...state}><XhRatingControl>{[1, 2, 3].map(value => <XhRatingItem key={value} value={value} />)}</XhRatingControl></XhRatingRoot>,
    host: root => root.querySelector<HTMLElement>('[data-scope="rating"][data-part="control"]')!,
  },
  {
    name: 'toggle-group',
    axes: { readOnly: 'aria-readonly', invalid: 'aria-invalid', required: 'aria-required' },
    render: state => <XhToggleGroupRoot collection={[{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]} {...state} />,
    host: root => root.querySelector<HTMLElement>('[data-scope="toggle-group"][data-part="root"]')!,
  },
  {
    name: 'color-picker',
    axes: { invalid: 'aria-invalid' },
    render: state => <XhColorPickerRoot {...state}><XhColorPickerControl><XhColorPickerTrigger><XhColorPickerValueText /></XhColorPickerTrigger></XhColorPickerControl></XhColorPickerRoot>,
    host: root => root.querySelector<HTMLElement>('[data-scope="color-picker"][data-part="trigger"]')!,
    wired: true,
  },
]

const ARIA_RULES = ['aria-allowed-attr', 'aria-valid-attr-value', 'aria-prohibited-attr', 'aria-required-attr', 'aria-allowed-role']

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

async function mountInField(c: Case, field: State, control: State): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      // 库内控件直接放进字段，状态经组件树交下来；XhFieldControl 只给原生或自写的控件用
      <XhFieldRoot {...field}>
        <XhFieldLabel>字段</XhFieldLabel>
        {c.render(control)}
        <XhFieldErrorText>必填</XhFieldErrorText>
      </XhFieldRoot>,
    )
  })
  unmount = () => act(() => root.unmount())
  await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return host
}

function allOn(c: Case): State {
  return Object.fromEntries(Object.keys(c.axes).map(axis => [axis, true]))
}

function allOff(c: Case): State {
  return Object.fromEntries(Object.keys(c.axes).map(axis => [axis, false]))
}

describe('字段控件的 readOnly / invalid / required（React）', () => {
  for (const c of CASES) {
    it(`${c.name}：放进字段时继承 ${Object.keys(c.axes).join(' / ')}`, async () => {
      const root = await mountInField(c, allOn(c), {})
      for (const attr of Object.values(c.axes))
        expect(c.host(root).getAttribute(attr!)).toBe('true')
    })

    it(`${c.name}：实例显式写 false 顶掉字段的状态`, async () => {
      const root = await mountInField(c, allOn(c), allOff(c))
      for (const attr of Object.values(c.axes))
        expect(c.host(root).getAttribute(attr!)).toBe('false')
    })

    if (c.wired) {
      it(`${c.name}：字段的标签并进名字链、错误文案并进描述链`, async () => {
        const root = await mountInField(c, allOn(c), {})
        const label = root.querySelector<HTMLElement>('[data-scope="field"][data-part="label"]')!.id
        const error = root.querySelector<HTMLElement>('[data-scope="field"][data-part="error-text"]')!.id
        expect(c.host(root).getAttribute('aria-labelledby')?.split(/\s+/)).toContain(label)
        expect(c.host(root).getAttribute('aria-describedby')?.split(/\s+/)).toContain(error)
      })
    }

    it(`${c.name}：axe 不报属性与角色问题`, async () => {
      const root = await mountInField(c, allOn(c), {})
      const { violations } = await runAxe(root)
      expect(violations.filter(v => ARIA_RULES.includes(v.id)).map(v => v.id)).toEqual([])
    })
  }
})
