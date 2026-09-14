import type { ListboxNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxGroup,
  XhListboxGroupLabel,
  XhListboxItem,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxLoading,
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | undefined
let host: HTMLElement | undefined

function element(selector: string): HTMLElement {
  const result = host?.querySelector<HTMLElement>(selector)
  if (!result)
    throw new Error(`缺少测试节点 ${selector}`)
  return result
}

function part(name: string): HTMLElement {
  return element(`[data-scope='listbox'][data-part='${name}']`)
}

function row(value: string): HTMLElement {
  return element(`[data-part='item'][data-value='${value}']`)
}

function mount(render: () => ReturnType<typeof h>): void {
  host = document.createElement('div')
  host.style.inlineSize = '300px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = undefined
  host = undefined
})

describe('列表框零候选与状态占位', () => {
  for (const selectionMode of ['single', 'multiple'] as const) {
    it(`${selectionMode}：空集合与首次加载不留空框，作者状态可见，恢复后键盘可重新进入`, async () => {
      const collection = ref<ListboxNode[]>([])
      const loading = ref(false)
      mount(() => h('div', [
        h('button', { id: 'before' }, '之前'),
        h(XhListboxRoot, { collection: collection.value, loading: loading.value, selectionMode }, () => [
          h(XhListboxLabel, null, () => '候选'),
          h(XhListboxContent, null, () => [
            '   ',
            h(XhListboxGroup, { value: 'empty' }, () => h(XhListboxGroupLabel, null, () => '空分组')),
            ...collection.value.map(node => h(XhListboxItem, { value: node.value }, () =>
              h(XhListboxItemText, null, () => node.label))),
          ]),
          h(XhListboxEmpty, null, () => '没有匹配的候选'),
          h(XhListboxLoading, null, () => '正在获取候选'),
        ]),
        h('button', { id: 'after' }, '之后'),
      ]))
      await nextTick()
      expect(part('content').getBoundingClientRect().height).toBe(0)
      expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
      expect(part('loading').getBoundingClientRect().height).toBe(0)
      element('#before').focus()
      await userEvent.keyboard('{Tab}')
      expect(document.activeElement).toBe(element('#after'))

      loading.value = true
      await nextTick()
      expect(part('content').getBoundingClientRect().height).toBe(0)
      expect(part('empty').getBoundingClientRect().height).toBe(0)
      expect(part('loading').textContent).toBe('正在获取候选')
      expect(part('loading').getBoundingClientRect().height).toBeGreaterThan(0)

      collection.value = [{ value: 'apple', label: '苹果' }, { value: 'blocked', label: '禁用候选', disabled: true }]
      loading.value = false
      await nextTick()
      expect(part('content').getBoundingClientRect().height).toBeGreaterThan(0)
      expect(part('empty').getBoundingClientRect().height).toBe(0)
      expect(part('loading').getBoundingClientRect().height).toBe(0)
      expect(part('group').getBoundingClientRect().height).toBe(0)
      element('#before').focus()
      await userEvent.keyboard('{Tab}{Enter}')
      expect(document.activeElement).toBe(row('apple'))
      expect(row('apple').getAttribute('aria-selected')).toBe('true')

      collection.value = []
      await nextTick()
      expect(part('content').getBoundingClientRect().height).toBe(0)
      collection.value = [{ value: 'pear', label: '梨' }]
      await nextTick()
      element('#before').focus()
      await userEvent.keyboard('{Tab}{Enter}')
      expect(document.activeElement).toBe(row('pear'))
      expect(row('pear').getAttribute('aria-selected')).toBe('true')
    })

    it(`${selectionMode}：没有作者状态文案的默认结构收起空框，不制造空白状态节点`, async () => {
      const collection = ref<ListboxNode[]>([])
      mount(() => h(XhListboxRoot, { collection: collection.value, loading: true, selectionMode, label: '候选' }))
      await nextTick()
      expect(part('content').getBoundingClientRect().height).toBe(0)
      expect(host?.querySelector(`[data-part='empty'], [data-part='loading']`)).toBeNull()
      collection.value = [{ value: 'blocked', label: '暂不可选', disabled: true }]
      await nextTick()
      expect(part('content').getBoundingClientRect().height).toBeGreaterThan(0)
      expect(row('blocked').getBoundingClientRect().height).toBeGreaterThan(0)
      expect(row('blocked').getAttribute('aria-disabled')).toBe('true')
    })
  }

  it('手写结构的 hidden 分组不参与导航和全选，全部隐藏后收框，恢复后保留键盘入口', async () => {
    const hideVisible = ref(false)
    mount(() => h('div', [
      h('button', { id: 'before' }, '之前'),
      h(XhListboxRoot, { selectionMode: 'multiple' }, () => [
        h(XhListboxLabel, null, () => '候选'),
        h(XhListboxContent, null, () => [
          '\n   ',
          h(XhListboxItem, { value: 'apple', hidden: hideVisible.value }, () => '苹果'),
          h(XhListboxGroup, { value: 'concealed', hidden: true }, () => [
            h(XhListboxGroupLabel, null, () => '隐藏分组'),
            h(XhListboxItem, { value: 'banana' }, () => '香蕉'),
          ]),
          h(XhListboxItem, { value: 'pear', hidden: hideVisible.value }, () => '梨'),
        ]),
        h(XhListboxEmpty, { hidden: !hideVisible.value }, () => '没有显示中的候选'),
      ]),
      h('button', { id: 'after' }, '之后'),
    ]))
    await nextTick()
    row('apple').focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(row('pear'))
    await userEvent.keyboard('{Control>}a{/Control}')
    expect(row('apple').getAttribute('aria-selected')).toBe('true')
    expect(row('pear').getAttribute('aria-selected')).toBe('true')
    expect(row('banana').getAttribute('aria-selected')).toBe('false')

    hideVisible.value = true
    await nextTick()
    expect(part('content').getBoundingClientRect().height).toBe(0)
    expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
    element('#before').focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(element('#after'))
    hideVisible.value = false
    await nextTick()
    element('#before').focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(row('apple'))
  })

  it('空组与 hidden 组不会给首个可见分组留下顶部间距', async () => {
    mount(() => h(XhListboxRoot, null, () => h(XhListboxContent, null, () => [
      h(XhListboxGroup, { value: 'empty' }, () => h(XhListboxGroupLabel, null, () => '空组')),
      h(XhListboxGroup, { value: 'hidden', hidden: true }, () => h(XhListboxItem, { value: 'banana' }, () => '香蕉')),
      h(XhListboxGroup, { value: 'visible', id: 'visible-group' }, () => h(XhListboxItem, { value: 'apple' }, () => '苹果')),
    ])))
    await nextTick()
    expect(part('group').getBoundingClientRect().height).toBe(0)
    expect(getComputedStyle(element('#visible-group')).marginBlockStart).toBe('0px')
  })

  it('外层 Popover 退场时列表和分组保持高度，直到父面板完成 Presence', async () => {
    const open = ref(true)
    mount(() => h(XhPopoverRoot, { open: open.value }, () => [
      h(XhPopoverTrigger, null, () => '选择水果'),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () =>
        h(XhListboxRoot, null, () => [
          h(XhListboxLabel, null, () => '水果'),
          h(XhListboxContent, null, () => [
            h(XhListboxGroup, { value: 'first' }, () => [
              h(XhListboxGroupLabel, null, () => '第一组'),
              h(XhListboxItem, { value: 'apple' }, () => '苹果'),
            ]),
            h(XhListboxGroup, { value: 'second' }, () => [
              h(XhListboxGroupLabel, null, () => '第二组'),
              h(XhListboxItem, { value: 'pear' }, () => '梨'),
            ]),
          ]),
        ]))),
    ]))
    await nextTick()
    await nextTick()
    const panel = document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='content']`)!
    const list = panel.querySelector<HTMLElement>(`[data-scope='listbox'][data-part='content']`)!
    const groups = [...list.querySelectorAll<HTMLElement>(`[data-part='group']`)]
    const listHeight = list.offsetHeight
    const groupHeights = groups.map(group => group.offsetHeight)
    expect(listHeight).toBeGreaterThan(0)
    expect(groupHeights.every(height => height > 0)).toBe(true)
    open.value = false
    await nextTick()
    await nextTick()
    expect(panel.hidden).toBe(true)
    expect(getComputedStyle(panel).display).not.toBe('none')
    expect(list.offsetHeight).toBe(listHeight)
    expect(groups.map(group => group.offsetHeight)).toEqual(groupHeights)
    await expect.poll(() => getComputedStyle(panel).display).toBe('none')
  })
})
