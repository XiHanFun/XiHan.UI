import type { AdapterEvent, AdapterHarness, Fixture } from '@xihan-ui/testing'
import type { Root } from 'react-dom/client'
import { attachHost } from '@xihan-ui/testing'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { declaredEvents, renderFixtureChildren, resolveRoot } from './fixture-element'

/** 对外语义事件 → React 侧的回调 prop 名。跨适配器一致的那一份。 */
const PUBLIC_EVENTS = {
  'checked-change': 'onCheckedChange',
  'decision': 'onDecision',
  'granted-scopes-change': 'onGrantedScopesChange',
  'clamp-toggle': 'onClampToggle',
  'color-error': 'onColorError',
  'branch-load-start': 'onBranchLoadStart',
  'branch-load': 'onBranchLoad',
  'branch-load-error': 'onBranchLoadError',
  'column-preference-change': 'onColumnPreferenceChange',
  'download-complete': 'onDownloadComplete',
  'download-error': 'onDownloadError',
  'answers-change': 'onAnswersChange',
  'expanded-value-change': 'onExpandedValueChange',
  'index-change': 'onIndexChange',
  'notes-change': 'onNotesChange',
  'item-delete': 'onItemDelete',
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

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

/** 只在这一段里开 act 环境标记，套件自己派的 DOM 事件不受影响。 */
async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

export function createReactHarness(): AdapterHarness {
  let host: HTMLElement | null = null
  let root: Root | null = null
  let render: ((next: Record<string, unknown>) => void) | null = null
  let props: Record<string, unknown> = {}
  let events: AdapterEvent[] = []

  /**
   * 一路刷到 DOM 不再动为止。
   *
   * 固定刷几拍是靠不住的：从「派事件」到「属性落到节点上」要经过
   * 机器写 context → 版本号自增 → 重渲 → 提交后效应 这条链，中间还可能夹着机器自己的
   * flush 效应，需要几拍取决于组件。少刷一拍，快照就停在上一帧。
   *
   * 每一拍交给 act 的是同步回调而不是异步的：异步那条路 act 恒要让出一个宏任务，
   * 用例排在计时器上的东西会被这一拍提前带进来——冲刷本该只把框架排空，不该把时间往前推。
   * Vue 那一侧的 nextTick 同样不推时间，两个宿主的「一帧」于是是同一个意思。
   * 同步这条路只在 act 队列里真有活时才让出宏任务，机器的更新本就由 flushSync 同步提交。
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
        await inAct(() => {})
        // 机器的 flush 排在微任务上，act 之后再排一次干净
        await Promise.resolve()
        if (!mutated)
          return
      }
    }
    finally {
      observer.disconnect()
    }
  }

  return {
    adapterName: 'react',

    async mount(fixture: Fixture) {
      host = document.createElement('div')
      attachHost(host)
      props = { ...fixture.props }
      events = []
      const Root = resolveRoot(fixture.component)

      // 无载荷记成 null：轨迹里「没有载荷」只能有一种写法，否则逐帧比对比的是两个平台的
      // 拼法而不是行为。取 DOM 那一种——CustomEvent.detail 缺省即 null。
      const record = (type: string) => (detail: unknown) => {
        if (detail instanceof Event)
          return
        events.push({ type, detail: detail === undefined ? null : detail })
      }
      // 只给组件自报的那几个装监听器：没声明的 onXxx 会落进 rest 透传到 DOM 上，
      // React 会为未知事件属性发警告
      const declared = declaredEvents(Root)
      const listeners: Record<string, (detail: unknown) => void> = {}
      for (const [event, listener] of Object.entries(PUBLIC_EVENTS)) {
        if (declared.has(event))
          listeners[listener] = record(event)
      }

      root = createRoot(host)
      render = (next) => {
        root!.render(createElement(
          Root,
          { ...fixture.tree.attrs, ...next, ...listeners },
          renderFixtureChildren(fixture.tree.children, fixture.component),
        ))
      }
      await inAct(async () => {
        render!(props)
      })
      await tick()
      return { root: host }
    },

    async setProps(next) {
      props = { ...props, ...next }
      await inAct(async () => {
        render?.(props)
      })
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
      await inAct(async () => {
        root?.unmount()
      })
      host?.remove()
      root = null
      host = null
      render = null
      events = []
    },
  }
}
