// @vitest-environment jsdom
// 浮层选单族的活动项唯一性：指针划过即把高亮/焦点搬到所在条目，指针离开即收掉，
// 不会出现「键盘锚点亮一条、hover 又亮一条」的双高亮，也不会离开后残留高亮。
// 行内 listbox 例外：hover 只走 CSS 皮肤，不动机器状态。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhListboxContent,
  XhListboxItem,
  XhListboxRoot,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mount(render: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

function pointer(target: HTMLElement, type: string, relatedTarget: HTMLElement | null = null): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: false, relatedTarget }))
}

describe('hover 跟随高亮', () => {
  it('menu：指针划过条目即把焦点搬来，旧锚点让位', async () => {
    mount(() => h(XhMenuRoot, null, () => [
      h(XhMenuTrigger, () => '菜单'),
      h(XhMenuPositioner, null, () => [
        h(XhMenuContent, null, () => [
          h(XhMenuItem, { value: 'copy' }, () => '复制'),
          h(XhMenuItem, { value: 'rename' }, () => '重命名'),
        ]),
      ]),
    ]))
    await tick()
    el('[data-scope="menu"][data-part="trigger"]').click()
    await tick()

    const rename = el('[data-scope="menu"][data-part="item"][data-value="rename"]')
    pointer(rename, 'pointerenter')
    await tick()
    expect(document.activeElement).toBe(rename)
    // roving tabindex 跟着搬：只有它留在 Tab 序列
    expect(rename.getAttribute('tabindex')).toBe('0')
    expect(el('[data-value="copy"]').getAttribute('tabindex')).toBe('-1')
  })

  it('menu：指针离开菜单后条目不留焦点，焦点还给 content、锚点清空', async () => {
    mount(() => h(XhMenuRoot, null, () => [
      h(XhMenuTrigger, () => '菜单'),
      h(XhMenuPositioner, null, () => [
        h(XhMenuContent, null, () => [
          h(XhMenuItem, { value: 'copy' }, () => '复制'),
          h(XhMenuItem, { value: 'rename' }, () => '重命名'),
        ]),
      ]),
    ]))
    await tick()
    el('[data-scope="menu"][data-part="trigger"]').click()
    await tick()

    const rename = el('[data-scope="menu"][data-part="item"][data-value="rename"]')
    pointer(rename, 'pointerenter')
    await tick()
    pointer(rename, 'pointerleave')
    await tick()
    const content = el('[data-scope="menu"][data-part="content"]')
    expect(document.activeElement).toBe(content)
    // 锚点清空后 Tab 停靠点由 content 兜底
    expect(content.getAttribute('tabindex')).toBe('0')
    expect(rename.getAttribute('tabindex')).toBe('-1')
  })

  it('menu：移到另一条目时不清锚点，由新条目接管', async () => {
    mount(() => h(XhMenuRoot, null, () => [
      h(XhMenuTrigger, () => '菜单'),
      h(XhMenuPositioner, null, () => [
        h(XhMenuContent, null, () => [
          h(XhMenuItem, { value: 'copy' }, () => '复制'),
          h(XhMenuItem, { value: 'rename' }, () => '重命名'),
        ]),
      ]),
    ]))
    await tick()
    el('[data-scope="menu"][data-part="trigger"]').click()
    await tick()

    const copy = el('[data-scope="menu"][data-part="item"][data-value="copy"]')
    const rename = el('[data-scope="menu"][data-part="item"][data-value="rename"]')
    pointer(copy, 'pointerenter')
    await tick()
    pointer(copy, 'pointerleave', rename)
    pointer(rename, 'pointerenter')
    await tick()
    expect(document.activeElement).toBe(rename)
    expect(rename.getAttribute('tabindex')).toBe('0')
  })

  it('context-menu：指针离开后 data-highlighted 不残留', async () => {
    mount(() => h(XhContextMenuRoot, null, () => [
      h(XhContextMenuTrigger, () => '右键这里'),
      h(XhContextMenuPositioner, null, () => [
        h(XhContextMenuContent, null, () => [
          h(XhContextMenuItem, { value: 'copy' }, () => '复制'),
          h(XhContextMenuItem, { value: 'rename' }, () => '重命名'),
        ]),
      ]),
    ]))
    await tick()
    const trigger = el('[data-scope="context-menu"][data-part="trigger"]')
    trigger.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 }))
    await tick()

    const rename = el('[data-scope="context-menu"][data-part="item"][data-value="rename"]')
    pointer(rename, 'pointerenter')
    await tick()
    expect(rename.hasAttribute('data-highlighted')).toBe(true)
    pointer(rename, 'pointerleave')
    await tick()
    expect(rename.hasAttribute('data-highlighted')).toBe(false)
    expect(document.activeElement).toBe(el('[data-scope="context-menu"][data-part="content"]'))
  })

  it('select：划过即高亮、离开即收、再进再亮', async () => {
    mount(() => h(XhSelectRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhSelectTrigger),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => h(XhSelectList, null, () => [
          h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
        ])),
      ]),
    ]))
    await tick()

    const a = el('[data-scope="select"][data-part="item"][data-value="a"]')
    const b = el('[data-scope="select"][data-part="item"][data-value="b"]')
    pointer(b, 'pointermove')
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(true)
    expect(a.hasAttribute('data-highlighted')).toBe(false)

    pointer(b, 'pointerleave')
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(false)
    expect(a.hasAttribute('data-highlighted')).toBe(false)

    pointer(b, 'pointermove')
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(true)
  })

  it('select：移到另一条目时高亮交接、不闪空', async () => {
    mount(() => h(XhSelectRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhSelectTrigger),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => h(XhSelectList, null, () => [
          h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
        ])),
      ]),
    ]))
    await tick()

    const a = el('[data-scope="select"][data-part="item"][data-value="a"]')
    const b = el('[data-scope="select"][data-part="item"][data-value="b"]')
    pointer(a, 'pointermove')
    await tick()
    pointer(a, 'pointerleave', b)
    pointer(b, 'pointermove')
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(true)
    expect(a.hasAttribute('data-highlighted')).toBe(false)
  })

  it('select：键盘建立的高亮不被指针路过清掉', async () => {
    mount(() => h(XhSelectRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhSelectTrigger),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => h(XhSelectList, null, () => [
          h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
        ])),
      ]),
    ]))
    await tick()

    const content = el('[data-scope="select"][data-part="content"]')
    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await tick()
    const active = el('[data-scope="select"][data-part="item"][data-highlighted]')
    // 指针横穿键盘高亮的条目再离开：pointermove 因已高亮不动作，leave 也不许收键盘的漆
    pointer(active, 'pointermove')
    pointer(active, 'pointerleave')
    await tick()
    expect(active.hasAttribute('data-highlighted')).toBe(true)
  })

  it('select：触摸 tap 序列里的 pointerleave 不清高亮', async () => {
    mount(() => h(XhSelectRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhSelectTrigger),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => h(XhSelectList, null, () => [
          h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
        ])),
      ]),
    ]))
    await tick()

    const b = el('[data-scope="select"][data-part="item"][data-value="b"]')
    b.dispatchEvent(new PointerEvent('pointermove', { bubbles: false, pointerType: 'touch' }))
    await tick()
    b.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false, pointerType: 'touch' }))
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(true)
  })

  it('select：指针落到条目之间的间隙上，高亮与焦点都不掉', async () => {
    mount(() => h(XhSelectRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhSelectTrigger),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => h(XhSelectList, null, () => [
          h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
        ])),
      ]),
    ]))
    await tick()

    const a = el('[data-scope="select"][data-part="item"][data-value="a"]')
    const list = el('[data-scope="select"][data-part="list"]')
    pointer(a, 'pointermove')
    await tick()
    expect(document.activeElement).toBe(a)

    // 条目之间留了间距，指针落在缝上：relatedTarget 是列表层而不是相邻条目
    pointer(a, 'pointerleave', list)
    await tick()
    expect(a.hasAttribute('data-highlighted')).toBe(true)
    expect(document.activeElement).toBe(a)
  })

  it('combobox：指针落到候选之间的间隙上，高亮不掉', async () => {
    mount(() => h(XhComboboxRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhComboboxControl, null, () => [h(XhComboboxInput)]),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, null, () => [
          h(XhComboboxItem, { value: 'a' }, () => [h(XhComboboxItemText, () => '甲')]),
          h(XhComboboxItem, { value: 'b' }, () => [h(XhComboboxItemText, () => '乙')]),
        ]),
      ]),
    ]))
    await tick()

    const a = el('[data-scope="combobox"][data-part="item"][data-value="a"]')
    const content = el('[data-scope="combobox"][data-part="content"]')
    pointer(a, 'pointermove')
    await tick()
    expect(a.hasAttribute('data-highlighted')).toBe(true)

    pointer(a, 'pointerleave', content)
    await tick()
    expect(a.hasAttribute('data-highlighted')).toBe(true)
  })

  it('combobox：指针真的移出浮层仍收掉高亮', async () => {
    mount(() => h(XhComboboxRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhComboboxControl, null, () => [h(XhComboboxInput)]),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, null, () => [
          h(XhComboboxItem, { value: 'a' }, () => [h(XhComboboxItemText, () => '甲')]),
          h(XhComboboxItem, { value: 'b' }, () => [h(XhComboboxItemText, () => '乙')]),
        ]),
      ]),
    ]))
    await tick()

    const a = el('[data-scope="combobox"][data-part="item"][data-value="a"]')
    pointer(a, 'pointermove')
    await tick()
    pointer(a, 'pointerleave')
    await tick()
    expect(a.hasAttribute('data-highlighted')).toBe(false)
  })

  it('行内 listbox：hover 不动机器高亮，键盘锚点不受指针影响', async () => {
    mount(() => h(XhListboxRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
    }, () => [
      h(XhListboxContent, null, () => [
        h(XhListboxItem, { value: 'a' }, () => '甲'),
        h(XhListboxItem, { value: 'b' }, () => '乙'),
      ]),
    ]))
    await tick()

    const b = el('[data-scope="listbox"][data-part="item"][data-value="b"]')
    pointer(b, 'pointermove')
    pointer(b, 'pointerenter')
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(false)
  })
})
