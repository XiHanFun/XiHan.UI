// 滑动指示器只在换项时滑：首次落位、同一项的重量（尺寸变化、换上正式字体）直接到位，
// 连续缩放窗口时不拖尾，字体换上时不伸缩一下。过渡在不在跑只有真实浏览器量得出来。
import type { App, Ref, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ENTRIES = [
  { value: 'a', label: '概览' },
  { value: 'b', label: '成员与权限' },
  { value: 'c', label: '账单' },
]

interface Case {
  /** 指示器所指的那一项的部件名。 */
  item: string
  render: (value: Ref<string>) => VNode
}

const CASES: Record<string, Case> = {
  tabs: {
    item: 'trigger',
    render: value => h(XhTabsRoot, { 'value': value.value, 'onUpdate:value': (next: string) => (value.value = next) }, () =>
      h(XhTabsList, null, () => [h(XhTabsIndicator), ...ENTRIES.map(entry => h(XhTabsTrigger, { value: entry.value }, () => entry.label))])),
  },
}

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function frames(count = 2): Promise<void> {
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 指示器上正在跑的 CSS 过渡（几何那几支）。 */
function sliding(el: Element): string[] {
  return el.getAnimations()
    .filter(a => a instanceof CSSTransition)
    .map(a => (a as CSSTransition).transitionProperty)
    .filter(property => property !== 'box-shadow')
}

describe.each(Object.entries(CASES))('%s 的指示器', (scope, c) => {
  function part(name: string, value?: string): HTMLElement {
    const selector = `[data-scope='${scope}'][data-part='${name}']${value ? `[data-value='${value}']` : ''}`
    return document.querySelector<HTMLElement>(selector)!
  }

  async function mount(): Promise<Ref<string>> {
    const value = ref('b')
    const host = document.createElement('div')
    host.style.inlineSize = '480px'
    document.body.append(host)
    app = createApp({ render: () => c.render(value) })
    app.mount(host)
    await frames(3)
    return value
  }

  it('首次落位直接到位，不从行首滑过来', async () => {
    await mount()
    expect(sliding(part('indicator'))).toEqual([])
  })

  it('换项才滑；落定后选中项变宽，重量直接到位、不拖尾', async () => {
    const value = await mount()
    value.value = 'c'
    await frames(1)
    const indicator = part('indicator')
    expect(sliding(indicator).length, '换项走皮肤过渡').toBeGreaterThan(0)
    for (const animation of indicator.getAnimations())
      animation.finish()

    // 同一项变宽（文案变长、换上正式字体都是这一路）：观察器回报后重量
    const item = part(c.item, 'c')
    item.style.padding = '16px 48px'
    await frames(3)
    expect(sliding(indicator), '重量不走过渡').toEqual([])
    const box = indicator.getBoundingClientRect()
    const target = item.getBoundingClientRect()
    const horizontal = box.width > box.height
    if (horizontal)
      expect(box.width).toBeCloseTo(target.width, 0)
    else expect(box.height).toBeCloseTo(target.height, 0)
  })
})
