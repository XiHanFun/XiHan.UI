// 表单与字段集里，带说明的字段与普通字段交替排时，每对相邻字段之间的留白一样：上一项最后一段看得见的内容
// （说明，没有说明就是控件）到下一项标签，都是一段项距 --xh-space-5。说明是字，不算留白；给错误文案留的那一行
// 空着，算项距。带说明的字段转无效时，错误文案顶替说明那一行，后面的字段不挪位。
// 页面量一次，再把标记装进有层与无层产物各量一次。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface FieldSpec {
  name: string
  description?: boolean
  error?: boolean
}

/** 带说明（有、没有错误文案）与普通字段（有、没有错误文案）交替排。 */
const FIELDS: FieldSpec[] = [
  { name: '甲', description: true, error: true },
  { name: '乙', error: true },
  { name: '丙', description: true },
  { name: '丁' },
  { name: '戊', description: true, error: true },
  { name: '己' },
]

afterEach(() => {
  closeSheetFrame()
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(markup: string): Promise<HTMLElement> {
  const host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.innerHTML = markup
  document.body.append(host)
  await settle()
  return host
}

/** 一个语义尺寸令牌解出来的像素。 */
function px(doc: Document, token: string): number {
  const probe = doc.createElement('div')
  probe.style.blockSize = `var(${token})`
  doc.body.append(probe)
  const value = probe.getBoundingClientRect().height
  probe.remove()
  return value
}

function shown(doc: Document, element: Element | null): element is HTMLElement {
  return !!element && !element.hasAttribute('hidden') && doc.defaultView!.getComputedStyle(element).display !== 'none'
}

/** 每对相邻字段之间的留白：上一项最后一段看得见的内容的底，到下一项标签的顶。 */
function gaps(doc: Document): number[] {
  const roots = [...doc.querySelectorAll<HTMLElement>(`[data-scope='field'][data-part='root']`)]
  return roots.slice(0, -1).map((root, index) => {
    const tail = [`description`, `error-text`, `control`]
      .map(part => root.querySelector(`[data-scope='field'][data-part='${part}']`))
      .find(element => shown(doc, element))!
    const next = roots[index + 1]!.querySelector(`[data-scope='field'][data-part='label']`)!
    return next.getBoundingClientRect().top - tail.getBoundingClientRect().bottom
  })
}

function expectEvenRhythm(doc: Document): void {
  const space = px(doc, '--xh-space-5')
  for (const gap of gaps(doc))
    expect(gap).toBeCloseTo(space, 0)
}

async function expectEvenEverywhere(host: HTMLElement): Promise<void> {
  expectEvenRhythm(document)
  const markup = host.outerHTML
  for (const sheet of SHEET_NAMES)
    expectEvenRhythm(await stageSheet(markup, sheet))
}

function field(spec: FieldSpec): string {
  return `<xh-field><div data-xh-part="root">
    <label data-xh-part="label">${spec.name}</label>
    <input data-xh-part="control">
    ${spec.description ? '<p data-xh-part="description">一行说明</p>' : ''}
    ${spec.error ? '<p data-xh-part="error-text">格式不对</p>' : ''}
  </div></xh-field>`
}

const GROUPED = `<xh-form><form data-xh-part="root">${FIELDS.map(spec => `<div data-xh-part="field-group" name="${spec.name}">${field(spec)}</div>`).join('')}</form></xh-form>`

describe('wc 带说明的字段与普通字段交替排', () => {
  it('表单（每项包 field-group）：每对相邻字段之间的留白都是一段项距', async () => {
    await expectEvenEverywhere(await mount(GROUPED))
  })

  it('字段直接放进表单：同一套', async () => {
    await expectEvenEverywhere(await mount(`<xh-form><form data-xh-part="root">${FIELDS.map(field).join('')}</form></xh-form>`))
  })

  it('字段集：同一套', async () => {
    await expectEvenEverywhere(await mount(`<xh-fieldset><fieldset data-xh-part="root"><legend data-xh-part="legend">账号</legend>${FIELDS.map(field).join('')}</fieldset></xh-fieldset>`))
  })

  it('带说明的字段转无效：错误文案顶替说明那一行，后面的字段不挪位', async () => {
    await mount(GROUPED)
    const labels = (): number[] => [...document.querySelectorAll(`[data-scope='field'][data-part='label']`)].map(label => label.getBoundingClientRect().top)
    const before = labels()
    document.querySelector('xh-field')!.setAttribute('invalid', '')
    await settle()
    expect(document.querySelector(`[data-scope='field'][data-part='error-text']:not([hidden])`)).not.toBeNull()
    expect(labels()).toEqual(before)
  })
})
