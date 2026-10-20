// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { MentionItemSelectDetails, MentionNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface MentionHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: MentionNode[]
  label?: string
  multiline?: boolean
  loading?: boolean
  translations?: { empty?: string, loading?: string }
}

const COLLECTION: MentionNode[] = [
  { value: 'lilei', label: 'Lilei' },
  { value: 'hanmeimei', label: 'Hanmeimei', description: '设计' },
  { value: 'poly', label: 'Poly' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: MentionHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<MentionHost>, inner = ''): MentionHost {
  const el = document.createElement('xh-mention') as MentionHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element | Document, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="mention"][data-part="${name}"]`)
}

function parts(el: Element | Document, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="mention"][data-part="${name}"]`)]
}

/** 直接子节点里本组件的部件名；滚动条是另一个组件的节点，不在其列。 */
function partsOf(parent: Element): string[] {
  return Array.from(parent.children)
    .filter(node => node.getAttribute('data-scope') === 'mention')
    .map(node => node.getAttribute('data-part') ?? '')
}

async function type(el: MentionHost, text: string): Promise<void> {
  const input = part(el, 'input') as HTMLInputElement
  input.focus()
  input.value = text
  input.setSelectionRange(text.length, text.length)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle(el)
}

describe('xh-mention 生成结构', () => {
  it('什么都不写：生成标题、单行输入框与浮层，浮层里是候选与空态，标题是指向输入框的原生 label', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '正文' })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['label', 'input', 'positioner'])
    const label = part(el, 'label')!
    const input = part(el, 'input')!
    expect([label.localName, input.localName]).toEqual(['label', 'input'])
    expect(label.getAttribute('for')).toBe(input.id)
    expect(partsOf(part(el, 'positioner')!)).toEqual(['content', 'empty', 'loading'])
    const items = parts(el, 'item')
    expect(items.map(item => item.getAttribute('data-value'))).toEqual(['lilei', 'hanmeimei', 'poly'])
    expect(partsOf(items[1]!)).toEqual(['item-text', 'item-description'])
    expect(part(el, 'empty')!.hasAttribute('hidden')).toBe(true)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('敲下前缀即开，点候选把查询串换成候选文字并派发 item-select', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    const selected: MentionItemSelectDetails[] = []
    el.addEventListener('item-select', event => selected.push((event as CustomEvent<MentionItemSelectDetails>).detail))

    await type(el, '你好 @po')
    expect(part(el, 'input')!.getAttribute('aria-expanded')).toBe('true')
    parts(document, 'item')[2]!.click()
    await settle(el)
    expect(selected.map(detail => [detail.value, detail.label])).toEqual([['poly', 'Poly']])
    expect((part(el, 'input') as HTMLInputElement).value).toBe('你好 @Poly ')
  })

  it('collection 为空时空态露出，文字取 translations.empty；slot="empty" 接管它', async () => {
    const el = mount({ collection: [], translations: { empty: '没有匹配的人' } })
    await settle(el)
    expect(part(el, 'empty')!.textContent).toBe('没有匹配的人')

    const slotted = mount({ collection: [] }, '<strong slot="empty">空空如也</strong>')
    await settle(slotted)
    expect(part(slotted, 'empty')!.innerHTML).toBe('<strong slot="empty">空空如也</strong>')
  })

  it('multiline：输入框生成为 textarea、撤掉组合框角色；取数在途且没有候选时在途占位顶上，字取 translations.loading', async () => {
    const el = mount({ collection: [], multiline: true, loading: true, translations: { loading: '正在找人' } })
    await settle(el)
    const input = part(el, 'input')!
    expect(input.localName).toBe('textarea')
    expect([input.getAttribute('role'), input.hasAttribute('aria-expanded')]).toEqual([null, false])

    await type(el, '第一行\n@')
    const loading = part(document, 'loading')!
    expect([loading.hidden, loading.textContent]).toEqual([false, '正在找人'])
    expect(part(document, 'empty')!.hidden).toBe(true)
  })

  it('slot 接管标题、候选文字与行首行尾：作者节点搬进对应部件，没写的候选照数据铺', async () => {
    const el = mount({ collection: COLLECTION }, [
      '<b slot="label">正文</b>',
      '<em slot="item:poly">波莉</em>',
      '<i slot="item-prefix:lilei">L</i>',
      '<span slot="item-suffix:poly">在线</span>',
    ].join(''))
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">正文</b>')
    expect(parts(el, 'item-text').map(text => text.textContent)).toEqual(['Lilei', 'Hanmeimei', '波莉'])
    const items = parts(el, 'item')
    expect(partsOf(items[0]!)).toEqual(['item-prefix', 'item-text'])
    expect(partsOf(items[2]!)).toEqual(['item-text', 'item-suffix'])
  })

  it('作者写了部件：全归作者，不生成任何节点', async () => {
    const el = mount({}, `
      <div data-xh-part="root">
        <input data-xh-part="input" aria-label="正文">
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
      </div>`)
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['input', 'positioner'])
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
