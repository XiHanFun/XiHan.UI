// 名字链与描述链只引用在场的部件：字段没写说明、控件没写自己的 label 时，引用的每个 id 都查得回节点，axe 不报无效引用。
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function mount(markup: string): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

/** 容器里每条 aria-labelledby / aria-describedby 引用的 id 都要能在文档里找到。 */
function danglingRefs(root: HTMLElement): string[] {
  const out: string[] = []
  for (const el of root.querySelectorAll('[aria-labelledby], [aria-describedby]')) {
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id))
          out.push(`${el.localName}[${attr}] → ${id}`)
      }
    }
  }
  return out
}

async function refViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => ['aria-valid-attr-value', 'aria-input-field-name', 'button-name', 'label'].includes(v.id)).map(v => v.id)
}

const SELECT = `
  <xh-select>
    <div data-xh-part="root">
      <button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>
      <select data-xh-part="hidden-select"></select>
      <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list"></div></div></div>
    </div>
  </xh-select>`
const TEXT_FIELD = `
  <xh-text-field>
    <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>
  </xh-text-field>`

describe('只引用在场的部件', () => {
  it('字段没写说明、invalid：下拉触发钮只引用字段标签与错误文案', async () => {
    const root = await mount(`
      <xh-field invalid>
        <div data-xh-part="root"><label data-xh-part="label">部门</label>${SELECT}<p data-xh-part="error-text">必填</p></div>
      </xh-field>`)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('字段没写说明：没写自己 label 的文本框，名字链只有字段标签', async () => {
    const root = await mount(`
      <xh-field>
        <div data-xh-part="root"><label data-xh-part="label">邮箱</label>${TEXT_FIELD}</div>
      </xh-field>`)
    const input = root.querySelector('input')!
    expect(input.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-scope="field"][data-part="label"]')!.id)
    expect(input.hasAttribute('aria-describedby')).toBe(false)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('字段外没写自己 label 的文本框：不写 aria-labelledby，作者写的 aria-label 生效', async () => {
    const root = await mount(`
      <xh-text-field>
        <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input" aria-label="搜索"></div></div>
      </xh-text-field>`)
    expect(root.querySelector('input')!.hasAttribute('aria-labelledby')).toBe(false)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('写了自己 label 的文本框照旧引用它', async () => {
    const root = await mount(`
      <xh-text-field>
        <div data-xh-part="root"><label data-xh-part="label">昵称</label><div data-xh-part="control"><input data-xh-part="input"></div></div>
      </xh-text-field>`)
    const input = root.querySelector('input')!
    expect(input.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-scope="text-field"][data-part="label"]')!.id)
    expect(danglingRefs(root)).toEqual([])
  })
})
