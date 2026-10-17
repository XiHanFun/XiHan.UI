// 字段控件补齐的 readOnly / invalid / required：放进 xh-field 时自动继承，实例显式给的值优先；
// ARIA 落在支持它的那个角色上，axe 不报属性与角色问题。
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type Axis = 'readOnly' | 'invalid' | 'required'
type State = Partial<Record<Axis, boolean>>

const ATTR: Record<Axis, string> = { readOnly: 'read-only', invalid: 'invalid', required: 'required' }

interface Case {
  name: string
  /** 这一笔补上的轴，以及每条轴在承载节点上写的属性。 */
  axes: Partial<Record<Axis, string>>
  /** 控件的标记；state 写成属性，假值写成 ="false"。 */
  markup: (attrs: string) => string
  /** 承载状态的那个节点。 */
  host: (root: HTMLElement) => HTMLElement
}

const CASES: Case[] = [
  {
    name: 'rating',
    axes: { invalid: 'aria-invalid' },
    markup: attrs => `<xh-rating count="3" ${attrs}><div data-xh-part="root"><div data-xh-part="control">${[1, 2, 3].map(v => `<span data-xh-part="item" value="${v}"></span>`).join('')}</div></div></xh-rating>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="rating"][data-part="control"]')!,
  },
]

const ARIA_RULES = ['aria-allowed-attr', 'aria-valid-attr-value', 'aria-prohibited-attr', 'aria-required-attr', 'aria-allowed-role']

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function attrsOf(state: State): string {
  return Object.entries(state).map(([axis, on]) => (on ? ATTR[axis as Axis] : `${ATTR[axis as Axis]}="false"`)).join(' ')
}

async function mountInField(c: Case, field: State, control: State): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-field ${attrsOf(field)}>
      <div data-xh-part="root">
        <label data-xh-part="label">字段</label>
        ${c.markup(attrsOf(control))}
        <p data-xh-part="error-text">必填</p>
      </div>
    </xh-field>`
  document.body.append(host)
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

function allOn(c: Case): State {
  return Object.fromEntries(Object.keys(c.axes).map(axis => [axis, true]))
}

function allOff(c: Case): State {
  return Object.fromEntries(Object.keys(c.axes).map(axis => [axis, false]))
}

describe('字段控件的 readOnly / invalid / required（Web Components）', () => {
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
