import type { AdapterEvent, AdapterHarness, Fixture, FixtureNode } from '@xihan-ui/testing'
import type { App, Component, VNode } from 'vue'
import { createApp, h, nextTick, reactive } from 'vue'
import * as X from '../src'

const registry = X as unknown as Record<string, Component>

function pascal(s: string): string {
  return s.split(/[-_]/).filter(Boolean).map(w => w[0]!.toUpperCase() + w.slice(1)).join('')
}

// 根组件命名可能带 Root 后缀（XhDialogRoot），也可能就是组件名本身（XhButton）。
function resolveRoot(component: string): Component {
  const root = registry[`Xh${pascal(component)}Root`] ?? registry[`Xh${pascal(component)}`]
  if (!root)
    throw new Error(`vue 适配器缺根组件：Xh${pascal(component)}[Root]`)
  return root
}

function resolvePart(component: string, part: string): Component {
  const comp = registry[`Xh${pascal(component)}${pascal(part)}`]
  if (!comp)
    throw new Error(`vue 适配器缺组件：Xh${pascal(component)}${pascal(part)}`)
  return comp
}

// FixtureNode → VNode。part 节点解析成对应组件，纯结构节点直接建元素；组件数增加时零改动。
function render(node: FixtureNode, component: string): VNode {
  if (node.part) {
    const kids = node.children?.map(c => render(c, component))
    const slot = kids ? () => kids : node.text != null ? () => node.text : undefined
    return h(resolvePart(component, node.part), { ...node.attrs }, slot ? { default: slot } : undefined)
  }
  const kids = node.children?.map(c => render(c, component))
  return h(node.tag ?? 'div', { ...node.attrs }, kids ?? node.text)
}

export function createVueHarness(): AdapterHarness {
  let app: App | null = null
  let host: HTMLElement | null = null
  const props = reactive<Record<string, unknown>>({})
  // 对外事件缓冲。M1 的 Button/Dialog 不派发领域事件，管道存在但空跑；
  // 适配器开始 emit 时在此登记各组件的对外事件清单即可。
  let events: AdapterEvent[] = []

  const tick = async (): Promise<void> => {
    await nextTick()
    await nextTick()
  }

  return {
    adapterName: 'vue',
    async mount(fixture: Fixture) {
      host = document.createElement('div')
      document.body.appendChild(host)
      for (const k of Object.keys(props)) delete props[k]
      Object.assign(props, fixture.props)
      const Root = resolveRoot(fixture.component)
      // 捕获对外语义事件（跨适配器一致的 emit）；v-model 的 update:open 是 Vue 特化
      // 语法糖、不入跨适配器事件流。无关组件忽略这些监听器。
      const listeners = {
        onOpenChange: (detail: unknown) => events.push({ type: 'open-change', detail }),
        onCheckedChange: (detail: unknown) => events.push({ type: 'checked-change', detail }),
        onPressedChange: (detail: unknown) => events.push({ type: 'pressed-change', detail }),
        onValueChange: (detail: unknown) => events.push({ type: 'value-change', detail }),
        onSelect: (detail: unknown) => events.push({ type: 'select', detail }),
      }
      app = createApp({
        setup: () => () =>
          h(Root, { ...props, ...listeners }, {
            default: () => fixture.tree.children?.map(c => render(c, fixture.component)) ?? [],
          }),
      })
      app.mount(host)
      await tick()
      return { root: host }
    },
    async setProps(next) {
      Object.assign(props, next)
      await tick()
    },
    async flush() {
      await tick()
    },
    drainEvents() {
      const e = events
      events = []
      return e
    },
    async unmount() {
      app?.unmount()
      host?.remove()
      app = null
      host = null
      events = []
    },
  }
}
