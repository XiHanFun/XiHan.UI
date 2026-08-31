import type { AdapterEvent, AdapterHarness, Fixture, FixtureNode } from '@xihan-ui/testing'
import type { App, Component, VNode } from 'vue'
import { attachHost } from '@xihan-ui/testing'
import { createApp, h, nextTick, reactive } from 'vue'
import * as X from '../src'

const registry = X as unknown as Record<string, Component>

const PUBLIC_EVENTS = {
  'checked-change': 'onCheckedChange',
  'clamp-toggle': 'onClampToggle',
  'column-preference-change': 'onColumnPreferenceChange',
  'download-complete': 'onDownloadComplete',
  'download-error': 'onDownloadError',
  'item-focus': 'onItemFocus',
  'node-move': 'onNodeMove',
  'open-change': 'onOpenChange',
  'pressed-change': 'onPressedChange',
  'row-move': 'onRowMove',
  'select': 'onSelect',
  'sort': 'onSort',
  'status-change': 'onStatusChange',
  'stick-change': 'onStickChange',
  'stop': 'onStop',
  'submit': 'onSubmit',
  'tab-move': 'onTabMove',
  'value-change': 'onValueChange',
} as const

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

function declaredEvents(component: Component): Set<string> {
  const emits = (component as { emits?: readonly string[] | Record<string, unknown> }).emits
  return new Set(Array.isArray(emits) ? emits : Object.keys(emits ?? {}))
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

  /**
   * 一路刷到 DOM 不再动为止。
   *
   * 固定刷几拍是靠不住的：从"派事件"到"属性落到节点上"要经过
   * 机器写 context → Vue 依赖失效 → 重渲 这条链，中间还可能夹着机器自己的 flush 效应，
   * 需要几拍取决于组件。少刷一拍，快照就停在上一帧，断言会假红（组件明明对了）
   * 或假绿（期望值恰好等于旧值）。
   *
   * 改成"看 DOM 还动不动"：动就再刷一拍。上限只是防死循环用的保险，
   * 正常组件一两拍就静下来了。
   */
  const tick = async (): Promise<void> => {
    let mutated = false
    const observer = new MutationObserver(() => {
      mutated = true
    })
    if (host)
      observer.observe(host, { attributes: true, childList: true, subtree: true, characterData: true })
    try {
      for (let round = 0; round < 10; round++) {
        mutated = false
        await nextTick()
        await nextTick()
        if (!mutated)
          return
      }
    }
    finally {
      observer.disconnect()
    }
  }

  return {
    adapterName: 'vue',
    async mount(fixture: Fixture) {
      host = document.createElement('div')
      attachHost(host)
      for (const k of Object.keys(props)) delete props[k]
      Object.assign(props, fixture.props)
      const Root = resolveRoot(fixture.component)
      // 捕获对外语义事件（跨适配器一致的 emit）；v-model 的 update:open 是 Vue 特化
      // 语法糖、不入跨适配器事件流。只传 Root 明确声明的监听器；未声明的 onX 会被
      // Vue 当普通属性透传到根元素，Fragment 根还会产生 Extraneous non-emits warning。
      const record = (type: string) => (detail: unknown) => {
        if (detail instanceof Event)
          return
        events.push({ type, detail })
      }
      const declared = declaredEvents(Root)
      const listeners: Record<string, (detail: unknown) => void> = {}
      for (const [event, listener] of Object.entries(PUBLIC_EVENTS)) {
        if (declared.has(event))
          listeners[listener] = record(event)
      }
      // 根节点上作者写的属性（aria-label 之类的标注）跟着走：WC 侧本就把它们
      // setAttribute 到角色节点上，Vue 侧经透传落到根组件渲染出的那个元素上
      app = createApp({
        setup: () => () =>
          h(Root, { ...fixture.tree.attrs, ...props, ...listeners }, {
            default: () => fixture.tree.children?.map(c => render(c, fixture.component)) ?? [],
          }),
      })
      app.config.warnHandler = (message) => {
        throw new Error(`[Vue warn]: ${message}`)
      }
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
