// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { TagGroupItemDeleteDetails, TagGroupNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TagGroupHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TagGroupNode[]
  label?: string
  deletable?: boolean
  selectionMode?: string
}

const COLLECTION: TagGroupNode[] = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte', disabled: true },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TagGroupHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TagGroupHost>, inner = ''): TagGroupHost {
  const el = document.createElement('xh-tag-group') as TagGroupHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string, scope = 'tag-group'): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

/** 列表里在场的标签（tag 的 root），按文档序。 */
function tags(el: Element): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-scope="tag-group"][data-part="list"] > [data-scope="tag"][data-part="root"]:not([inert])')]
}

/** 直接子节点的「scope/部件名」。 */
function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => `${node.getAttribute('data-scope')}/${node.getAttribute('data-part')}`)
}

describe('xh-tag-group 生成结构', () => {
  it('什么都不写：生成标题与标签列表，标签接成 tag 的 root，格子里是文字、选中标记与摘除钮，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '技术栈', deletable: true })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['tag-group/label', 'tag-group/list'])
    const list = part(el, 'list')!
    expect(list.getAttribute('role')).toBe('grid')
    expect(list.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    const all = tags(el)
    expect(all.map(tag => [tag.getAttribute('data-value'), tag.getAttribute('role')])).toEqual([
      ['vue', 'row'],
      ['react', 'row'],
      ['svelte', 'row'],
    ])
    expect(partsOf(all[0]!)).toEqual(['tag-group/cell'])
    expect(partsOf(part(all[0]!, 'cell')!)).toEqual(['tag/label', 'tag-group/item-indicator', 'tag/close-trigger'])
    expect(all.map(tag => part(tag, 'label', 'tag')!.textContent)).toEqual(['Vue', 'React', 'Svelte'])
    expect(all[2]!.getAttribute('aria-disabled')).toBe('true')
    expect(part(all[0]!, 'close-trigger', 'tag')!.getAttribute('aria-label')).toBe('Delete Vue')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('点生成的标签即选中；摘除只报意图，宿主改 collection 后标签随之离场', async () => {
    const el = mount({ collection: COLLECTION, selectionMode: 'single', deletable: true })
    await settle(el)
    const changes: string[][] = []
    el.addEventListener('value-change', event => changes.push((event as CustomEvent<{ value: string[] }>).detail.value))
    const deletes: string[] = []
    el.addEventListener('item-delete', event => deletes.push((event as CustomEvent<TagGroupItemDeleteDetails>).detail.value))

    tags(el)[1]!.click()
    await settle(el)
    expect(changes).toEqual([['react']])
    expect(tags(el).map(tag => tag.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])

    part(tags(el)[0]!, 'close-trigger', 'tag')!.click()
    await settle(el)
    expect(deletes).toEqual(['vue'])
    expect(tags(el)).toHaveLength(3)

    el.collection = COLLECTION.slice(1)
    await settle(el)
    expect(tags(el).map(tag => tag.getAttribute('data-value'))).toEqual(['react', 'svelte'])
  })

  it('没给 collection 也生成：列表是空的，必备部件都在', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({})
    await settle(el)

    expect(part(el, 'label')).toBeNull()
    expect(part(el, 'list')!.children).toHaveLength(0)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('slot 接管标题与标签文字：作者节点搬进对应部件，没写的标签照数据铺', async () => {
    const el = mount({ collection: COLLECTION }, '<b slot="label">技术栈</b><em slot="item:react">React 19</em>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">技术栈</b>')
    expect(part(el, 'list')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    expect(tags(el).map(tag => part(tag, 'label', 'tag')!.textContent)).toEqual(['Vue', 'React 19', 'Svelte'])
  })

  it('作者写了部件：全归作者，不生成任何节点', async () => {
    const el = mount({}, `
      <div data-xh-part="root">
        <div data-xh-part="list">
          <span data-xh-part="item" value="vue"><span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span></span>
        </div>
      </div>`)
    await settle(el)
    expect(tags(el)).toHaveLength(1)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
