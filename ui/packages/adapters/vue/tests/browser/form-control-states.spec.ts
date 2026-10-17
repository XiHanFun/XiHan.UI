// 字段控件补齐的 readOnly / invalid / required：放进 XhField 时自动继承，实例显式给的值优先；
// ARIA 落在支持它的那个角色上，axe 不报属性与角色问题。
import type { App, VNode } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Axis = 'readOnly' | 'invalid' | 'required'
type State = Partial<Record<Axis, boolean>>
/** 控件的 props：这几条轴之外还可以带别的初值。 */
type ControlProps = State & Record<string, unknown>

interface Case {
  name: string
  /** 这一笔补上的轴，以及每条轴在承载节点上写的属性。 */
  axes: Partial<Record<Axis, string>>
  render: (props: ControlProps) => VNode
  /** 承载状态的那个节点。 */
  host: (root: HTMLElement) => HTMLElement
}

const CASES: Case[] = [
  {
    name: 'rating',
    axes: { invalid: 'aria-invalid' },
    render: props => h(XhRatingRoot, { count: 3, ...props }, () => h(XhRatingControl, null, () => [1, 2, 3].map(value => h(XhRatingItem, { key: value, value })))),
    host: root => root.querySelector<HTMLElement>('[data-scope="rating"][data-part="control"]')!,
  },
]

const ARIA_RULES = ['aria-allowed-attr', 'aria-valid-attr-value', 'aria-prohibited-attr', 'aria-required-attr', 'aria-allowed-role']

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountInField(c: Case, field: State, control: ControlProps): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldRoot, { ...field }, () => [
      h(XhFieldLabel, null, () => '字段'),
      // 库内控件直接放进字段，状态经组件树交下来；XhFieldControl 只给原生或自写的控件用
      c.render(control),
      h(XhFieldErrorText, null, () => '必填'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

function allOn(c: Case): State {
  return Object.fromEntries(Object.keys(c.axes).map(axis => [axis, true]))
}

function allOff(c: Case): State {
  return Object.fromEntries(Object.keys(c.axes).map(axis => [axis, false]))
}

/** 一个颜色解析成 rgb() 串，好与计算样式比。 */
function resolveColor(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('rating 的无效态皮肤（Vue）', () => {
  it('invalid 时没点亮的星形取无效色，点亮的星照样是语气色', async () => {
    const root = await mountInField(CASES[0]!, {}, { invalid: true, defaultValue: 1 })
    const [lit, unlit] = [...root.querySelectorAll<HTMLElement>('[data-scope="rating"][data-part="item"]')]
    const invalid = resolveColor('var(--xh-border-invalid)')
    expect(getComputedStyle(unlit!, '::before').backgroundColor).toBe(invalid)
    expect(getComputedStyle(lit!, '::after').backgroundColor).not.toBe(invalid)
    expect(lit!.hasAttribute('data-highlighted')).toBe(true)
  })
})

describe('字段控件的 readOnly / invalid / required（Vue）', () => {
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

    it(`${c.name}：axe 不报属性与角色问题`, async () => {
      const root = await mountInField(c, allOn(c), {})
      const { violations } = await runAxe(root)
      expect(violations.filter(v => ARIA_RULES.includes(v.id)).map(v => v.id)).toEqual([])
    })
  }
})
