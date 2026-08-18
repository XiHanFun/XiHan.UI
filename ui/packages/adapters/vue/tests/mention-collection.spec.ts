// @vitest-environment jsdom
import type { MentionNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
} from '../src/components/mention/mention'

const COLLECTION: MentionNode[] = [
  { value: 'lilei', label: '李雷' },
  { value: 'hanmeimei', label: '韩梅梅' },
  { value: 'ghost', label: '幽灵', disabled: true },
]

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection() {
  return mount(defineComponent({
    setup: () => () => h(XhMentionRoot, { collection: COLLECTION }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts() {
  return mount(defineComponent({
    setup: () => () => h(XhMentionRoot, { collection: COLLECTION }, () => [
      h(XhMentionInput),
      h(XhMentionPositioner, () => [
        h(XhMentionContent, () => COLLECTION.map(node =>
          h(XhMentionItem, { key: node.value, value: node.value }, () => [
            h(XhMentionItemText, () => node.label),
          ]),
        )),
      ]),
    ]),
  }), { attachTo: document.body })
}

// 浮层的 positioner 搬到了 portal 落点，不再落在挂载根里，因此下面一律从整篇文档取件

/** 部件树：只取身份与无障碍属性，忽略由定位引擎写入的坐标 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="mention"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-selected', 'data-state', 'data-disabled', 'data-highlighted']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function textarea(root: Element): HTMLTextAreaElement {
  return root.querySelector('[data-part="input"]') as HTMLTextAreaElement
}

/** 打字：写值、摆光标、派原生 input 事件——组件的入口就是这三件。 */
async function type(el: HTMLTextAreaElement, text: string, caret = text.length): Promise<void> {
  el.focus()
  el.value = text
  el.setSelectionRange(caret, caret)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
  await nextTick()
}

describe('mention 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection()
    const parts = [...document.body.querySelectorAll('[data-scope="mention"][data-part]')]
      .map(el => el.getAttribute('data-part'))
    expect(parts).toEqual([
      'root',
      'input',
      'positioner',
      'content',
      'item',
      'item-text',
      'item',
      'item-text',
      'item',
      'item-text',
    ])
    w.unmount()
  })

  it('铺开的结构与手写部件逐字相同', () => {
    const auto = mountFromCollection()
    const autoTree = skeleton(document.body)
    auto.unmount()
    document.body.innerHTML = ''

    const manual = mountFromParts()
    expect(skeleton(document.body)).toEqual(autoTree)
    manual.unmount()
  })

  it('候选文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhMentionRoot, {
        collection: [{ value: 'lilei', label: '李雷' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...document.body.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(texts).toEqual(['李雷', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成候选的 aria-disabled', () => {
    const w = mountFromCollection()
    const flags = [...document.body.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('输入宿主默认是 textarea', () => {
    const w = mountFromCollection()
    expect(textarea(w.element).tagName).toBe('TEXTAREA')
    w.unmount()
  })

  it('敲下前缀即开，查询串随 query-change 交出去', async () => {
    const seen: Array<string | null> = []
    const w = mount(defineComponent({
      setup: () => () => h(XhMentionRoot, {
        collection: COLLECTION,
        onQueryChange: (d: { query: string | null }) => seen.push(d.query),
      }),
    }), { attachTo: document.body })
    await type(textarea(w.element), '你好 @li')
    expect(document.body.querySelector('[data-part="content"]')!.hasAttribute('hidden')).toBe(false)
    expect(seen.at(-1)).toBe('li')
    w.unmount()
  })

  it('回车把候选插到光标处：只换掉查询串，光标落在插入内容之后', async () => {
    const w = mountFromCollection()
    const el = textarea(w.element)
    // 光标停在 li 之后、后面那段之前
    await type(el, '请 @li 看一下', 5)
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()
    await nextTick()
    expect(el.value).toBe('请 @李雷  看一下')
    expect(el.selectionStart).toBe(6)
    w.unmount()
  })

  it('点候选与回车走同一条路', async () => {
    const w = mountFromCollection()
    const el = textarea(w.element)
    await type(el, '@')
    const items = [...document.body.querySelectorAll('[data-part="item"]')]
    items[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()
    expect(el.value).toBe('@韩梅梅 ')
    w.unmount()
  })
})
