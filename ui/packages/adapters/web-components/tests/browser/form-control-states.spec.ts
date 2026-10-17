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
  /** 承载节点另接字段的标签与描述链（按钮这类不收 aria-required 的控件走组类接线）。 */
  wired?: boolean
}

const CASES: Case[] = [
  {
    name: 'rating',
    axes: { invalid: 'aria-invalid' },
    markup: attrs => `<xh-rating count="3" ${attrs}><div data-xh-part="root"><div data-xh-part="control">${[1, 2, 3].map(v => `<span data-xh-part="item" value="${v}"></span>`).join('')}</div></div></xh-rating>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="rating"][data-part="control"]')!,
  },
  {
    name: 'toggle-group',
    axes: { readOnly: 'aria-readonly', invalid: 'aria-invalid', required: 'aria-required' },
    markup: attrs => `<xh-toggle-group ${attrs}><div data-xh-part="root"><button data-xh-part="item" value="a">甲</button><button data-xh-part="item" value="b">乙</button></div></xh-toggle-group>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="toggle-group"][data-part="root"]')!,
  },
  {
    name: 'color-picker',
    axes: { invalid: 'aria-invalid' },
    markup: attrs => `<xh-color-picker ${attrs}><div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger"><span data-xh-part="value-text"></span></button></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-color-picker>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="color-picker"][data-part="trigger"]')!,
    wired: true,
  },
  {
    name: 'file-upload',
    axes: { readOnly: 'aria-disabled' },
    markup: attrs => `<xh-file-upload ${attrs}><div data-xh-part="root"><div data-xh-part="dropzone">把文件拖到这里<input data-xh-part="hidden-input"></div></div></xh-file-upload>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="file-upload"][data-part="dropzone"]')!,
  },
  {
    name: 'cascader',
    axes: { required: 'aria-required' },
    markup: attrs => `<xh-cascader ${attrs}><div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger"><span data-xh-part="value-text"></span></button></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-cascader>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="cascader"][data-part="trigger"]')!,
    wired: true,
  },
  {
    name: 'tree-select',
    axes: { required: 'aria-required' },
    markup: attrs => `<xh-tree-select ${attrs}><div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger"><span data-xh-part="value-text"></span></button></div><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div></div></xh-tree-select>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="trigger"]')!,
    wired: true,
  },
  {
    name: 'transfer',
    axes: { required: 'aria-required' },
    markup: attrs => `<xh-transfer ${attrs}><div data-xh-part="root"><div data-xh-part="source-panel"><div data-xh-part="list"></div></div><div data-xh-part="target-panel"><div data-xh-part="list"></div></div></div></xh-transfer>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="transfer"][data-part="target-panel"] [data-scope="transfer"][data-part="list"]')!,
  },
  {
    name: 'combobox',
    axes: { required: 'aria-required' },
    markup: attrs => `<xh-combobox ${attrs}><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-combobox>`,
    host: root => root.querySelector<HTMLElement>('[data-scope="combobox"][data-part="input"]')!,
    wired: true,
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

    if (c.wired) {
      it(`${c.name}：字段的标签并进名字链、错误文案并进描述链`, async () => {
        // 错误文案只在字段 invalid 时渲出来
        const root = await mountInField(c, { ...allOn(c), invalid: true }, {})
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
