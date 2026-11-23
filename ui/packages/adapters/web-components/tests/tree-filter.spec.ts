// @vitest-environment jsdom
// 树的关键词过滤：裁剪与搜索视图在 Headless，这里核自定义元素这一侧的接线——
// filter-text 属性进了机器；手写的整棵树里不在搜索结果里的节点由元素收起，清空即放回。
import type { TreeNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TreeHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TreeNode[]
  filter?: (node: TreeNode, query: string) => boolean
}

const COLLECTION: TreeNode[] = [
  { value: 'src', label: 'Source', children: [{ value: 'index', label: 'Index' }, { value: 'utils', label: 'Utils' }] },
  { value: 'docs', label: 'Docs', children: [{ value: 'guide', label: 'Guide' }] },
  { value: 'license', label: 'License' },
]

const MARKUP = [
  '<div data-xh-part="root">',
  '  <div data-xh-part="tree">',
  '    <div data-xh-part="branch" value="src">',
  '      <div data-xh-part="branch-control"><span data-xh-part="branch-text">Source</span></div>',
  '      <div data-xh-part="branch-content">',
  '        <div data-xh-part="item" value="index"><span data-xh-part="item-text">Index</span></div>',
  '        <div data-xh-part="item" value="utils"><span data-xh-part="item-text">Utils</span></div>',
  '      </div>',
  '    </div>',
  '    <div data-xh-part="branch" value="docs">',
  '      <div data-xh-part="branch-control"><span data-xh-part="branch-text">Docs</span></div>',
  '      <div data-xh-part="branch-content">',
  '        <div data-xh-part="item" value="guide"><span data-xh-part="item-text">Guide</span></div>',
  '      </div>',
  '    </div>',
  '    <div data-xh-part="item" value="license"><span data-xh-part="item-text">License</span></div>',
  '  </div>',
  '</div>',
].join('\n')

const NODES = '[data-scope="tree"]:is([data-part="branch"], [data-part="item"])'
const DOCS = '[data-scope="tree"][data-part="branch"][data-value="docs"]'

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: TreeHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

/** 没被元素收起的节点值，按文档次序。 */
function shown(): string[] {
  return [...document.querySelectorAll<HTMLElement>(NODES)]
    .filter(el => !el.hidden)
    .map(el => el.getAttribute('data-value')!)
}

describe('xh-tree 的 filter-text', () => {
  it('手写的整棵树：不在搜索结果里的节点被收起，命中节点的祖先展开；撤掉属性即放回', async () => {
    const el = document.createElement('xh-tree') as TreeHost
    el.innerHTML = MARKUP
    el.collection = COLLECTION
    document.body.append(el)
    await settle(el)
    expect(shown()).toEqual(['src', 'index', 'utils', 'docs', 'guide', 'license'])

    el.setAttribute('filter-text', 'guide')
    await settle(el)
    expect(shown()).toEqual(['docs', 'guide'])
    expect(document.querySelector(DOCS)!.getAttribute('aria-expanded')).toBe('true')

    el.removeAttribute('filter-text')
    await settle(el)
    expect(shown()).toEqual(['src', 'index', 'utils', 'docs', 'guide', 'license'])
    expect(document.querySelector(DOCS)!.getAttribute('aria-expanded')).toBe('false')
  })

  it('自定义匹配规则经 filter 属性（property）给', async () => {
    const el = document.createElement('xh-tree') as TreeHost
    el.innerHTML = MARKUP
    el.collection = COLLECTION
    el.filter = node => node.value === 'license'
    el.setAttribute('filter-text', 'x')
    document.body.append(el)
    await settle(el)
    expect(shown()).toEqual(['license'])
  })
})
