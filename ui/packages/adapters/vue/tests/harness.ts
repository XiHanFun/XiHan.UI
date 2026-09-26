import type { AdapterEvent, AdapterHarness, Fixture } from '@xihan-ui/testing'
import type { App, Component } from 'vue'
import { attachHost } from '@xihan-ui/testing'
import { createApp, h, nextTick, reactive } from 'vue'
import { renderFixtureSlots, resolveRoot } from './fixture-vnode'

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
  'paused-change': 'onPausedChange',
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

function declaredEvents(component: Component): Set<string> {
  const emits = (component as { emits?: readonly string[] | Record<string, unknown> }).emits
  return new Set(Array.isArray(emits) ? emits : Object.keys(emits ?? {}))
}

export function createVueHarness(): AdapterHarness {
  let app: App | null = null
  let host: HTMLElement | null = null
  const props = reactive<Record<string, unknown>>({})
  // 对外事件缓冲：按 PUBLIC_EVENTS 的登记把 emit 收进来，供用例按序回放。
  let events: AdapterEvent[] = []

  /**
   * 挂载或重渲之后等墙钟跨过当前这一毫秒再交还。
   *
   * Vue 的事件包装会丢弃「早于监听器挂上」的事件：事件经过的第一个包装在它身上记下
   * Date.now()，冒泡路上后面的包装若挂上的时刻（按微任务周期缓存的 Date.now()）不早于它，
   * 就当这一下发生在挂上之前、直接跳过。JIT 热起来后挂载、聚焦、按第一个键能落在同一毫秒：
   * toggle-group 的方向键收口在容器上，条目那一层先记下时间戳，容器的包装与它同一毫秒挂上而被
   * 跳过，焦点原地不动——对拍随机判红，单跑不出现，前面先跑一批组件（JIT 变热）才出现。
   * 真实用户做不到在挂上的同一毫秒按键，这里补上这段间隔，每次最多 1ms。
   */
  const crossMillisecond = (): void => {
    const now = Date.now()
    while (Date.now() === now) {
      // 忙等不到 1ms：让之后派发的事件时间戳一定晚于这一拍挂上的监听器
    }
  }

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
    let changed = false
    const observer = new MutationObserver(() => {
      mutated = true
      changed = true
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
      // 重渲过就可能挂上了新的事件包装
      if (changed)
        crossMillisecond()
    }
  }

  return {
    adapterName: 'vue',
    async mount(fixture: Fixture) {
      // 一个 harness 同时只挂一份：上一条轨迹超时后没走到卸载，它那份还挂着，先卸掉再挂新的
      if (app)
        await this.unmount()
      host = document.createElement('div')
      attachHost(host)
      for (const k of Object.keys(props)) delete props[k]
      Object.assign(props, fixture.props)
      const Root = resolveRoot(fixture.component)
      // 捕获对外语义事件（跨适配器一致的 emit）；v-model 的 update:open 是 Vue 特化
      // 语法糖、不入跨适配器事件流。只传 Root 明确声明的监听器；未声明的 onX 会被
      // Vue 当普通属性透传到根元素，Fragment 根还会产生 Extraneous non-emits warning。
      // 无载荷记成 null：轨迹里「没有载荷」只能有一种写法，否则逐帧比对比的是两个平台的
      // 拼法而不是行为。取 DOM 那一种——CustomEvent.detail 缺省即 null，规范里没有 undefined 这一档，
      // WC 侧表达不出来；Vue 的无参 emit 到这里映射成同一个值。
      const record = (type: string) => (detail: unknown) => {
        if (detail instanceof Event)
          return
        events.push({ type, detail: detail === undefined ? null : detail })
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
          h(Root, { ...fixture.tree.attrs, ...props, ...listeners }, renderFixtureSlots(fixture.tree.children, fixture.component)),
      })
      app.config.warnHandler = (message) => {
        throw new Error(`[Vue warn]: ${message}`)
      }
      app.mount(host)
      await tick()
      // 挂载本身在 tick 之前就把事件包装全挂上了，tick 未必再看到 DOM 变动
      crossMillisecond()
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
