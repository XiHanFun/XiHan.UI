// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../src'

// 用例断言失败时不会跑到收尾，残留的 DOM 会污染下一条（选择器是全文档范围的）
afterEach(() => {
  document.body.innerHTML = ''
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

/** 故意不给 v-for 传 key：Vue 会就地复用 DOM 节点，只改 props。 */
function mountTabs(initial: readonly string[]): { values: ReturnType<typeof ref<string[]>>, unmount: () => void } {
  const values = ref<string[]>([...initial])
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhTabsRoot, { defaultValue: initial[0] }, {
        default: () => [
          h(XhTabsList, null, {
            default: () => values.value.map(v => h(XhTabsTrigger, { value: v }, () => v)),
          }),
          ...values.value.map(v => h(XhTabsContent, { value: v }, () => v)),
        ],
      }),
  })
  app.mount(host)
  const unmount = (): void => {
    app.unmount()
    host.remove()
  }
  return { values, unmount }
}

function triggers(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="tabs"][data-part="trigger"]')]
}
function tabStops(): string[] {
  return triggers().filter(t => t.getAttribute('tabindex') === '0').map(t => t.getAttribute('data-value')!)
}

// v-for 不带 key 时被卸载的是「最后一个组件实例」，持有焦点的 DOM 节点原地留下、
// value 却被改成了别的条目。锚点若不跟着纠正就会指向一个已无人认领的值，
// 于是没有条目 tabindex=0、整组脱离 Tab 序列。
describe('就地复用（v-for 不带 key）时的焦点锚点', () => {
  it('焦点节点的 value 被改写后，锚点跟着新值走，Tab 停靠点不丢', async () => {
    const app = mountTabs(['a', 'b', 'c'])
    await tick()

    // 焦点落到中间那个条目
    triggers()[1]!.focus()
    await tick()
    expect(tabStops()).toEqual(['b'])

    // 删掉第一个：就地复用下，原本显示 b 的那个节点现在承载 c
    app.values.value = ['b', 'c']
    await tick()

    const stops = tabStops()
    expect(stops).toHaveLength(1)
    // 焦点仍在原节点上，它现在代表的值必须就是锚点
    const focused = document.activeElement as HTMLElement
    expect(focused.getAttribute('data-part')).toBe('trigger')
    expect(stops[0]).toBe(focused.getAttribute('data-value'))

    app.unmount()
  })

  it('未持有焦点的条目改写 value 不动锚点', async () => {
    const app = mountTabs(['a', 'b', 'c'])
    await tick()

    triggers()[0]!.focus()
    await tick()
    expect(tabStops()).toEqual(['a'])

    // 改写的是末尾那个节点，焦点在首个节点上，锚点不该被抢走
    app.values.value = ['a', 'b', 'x']
    await tick()
    expect(tabStops()).toEqual(['a'])

    app.unmount()
  })
})
