// @xihan-ui/react/behavior —— 行为原语的 React 包装。
//
// @xihan-ui/core 里的原语都是框架无关的：收一份配置与 DOM 输入，返回一个要自己
// 释放的句柄。React 包装把建立、节点换代与释放对齐到提交生命周期，不改原语语义。
//
// 与主入口分开：自建浮层才用得上这一层，不用的应用不必把它压进主入口的体积。
// 需要层栈仪式的那几个（消解层、焦点域、背景失活）不在这里——
// 它们要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这种不报错的怪症，
// 那种场景请直接用库里现成的浮层组件。
import type {
  HoverIntentOptions as CoreHoverIntentOptions,
  RuntimeConfig,
  ScrollMetrics,
  ScrollTrackerOptions,
  StickToBottomOptions,
  StickToBottomState,
  Typeahead,
  TypeaheadOptions,
} from '@xihan-ui/core'
import {
  acquireScrollLock,
  createScrollTracker,
  createStickToBottom,
  createTypeahead,
  trackHoverIntent,
} from '@xihan-ui/core'
import { useEffect, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from './runtime/layout-effect'

/**
 * 按需加解滚动锁。锁是引用计数的，多处同时锁不会互相踩。
 *
 * 锁哪个元素由 `config.scrollRoot()` 决定；宿主把滚动搬进了内容容器
 * （body 自己不滚）时必须在配置里注入，否则锁到的是不滚的那个。
 */
export function useScrollLock(active: boolean, config: RuntimeConfig): void {
  // 配置每渲染都可能是新对象，锁只跟着开关走：现读那一份，别让它成为解锁重锁的理由
  const latest = useRef(config)
  latest.current = config
  useIsomorphicLayoutEffect(() => {
    if (!active)
      return
    const handle = acquireScrollLock({ config: latest.current })
    return () => handle.dispose()
  }, [active])
}

/**
 * 悬停意图：进触发器停够时长才报开，离开时按安全三角判断是不是正朝浮层去。
 * 用于自建的悬停浮层，省掉「斜着划向子菜单半路就关了」那类手写延时。
 */
export interface UseHoverIntentOptions extends Omit<CoreHoverIntentOptions, 'trigger'> {
  /** 当前悬停宿主；节点暂时不渲染时返回 null。 */
  getTriggerEl: () => HTMLElement | null
}

interface HoverIntentBinding {
  trigger: HTMLElement
  ownerDocument: Document
  openDelay: number | undefined
  closeDelay: number | undefined
  buffer: number | undefined
  stop: () => void
}

export function useHoverIntent(options: UseHoverIntentOptions): void {
  const latest = useRef(options)
  const binding = useRef<HoverIntentBinding | null>(null)

  const release = (): void => {
    binding.current?.stop()
    binding.current = null
  }

  // 每次已提交渲染后比较真正决定绑定身份的值；回调与 content getter 由 latest 转发，
  // 不会为普通闭包换代取消正在进行的悬停计时。
  useIsomorphicLayoutEffect(() => {
    latest.current = options
    const trigger = options.getTriggerEl()
    // null 表示这一帧没有可绑定节点；后续提交出现节点时会重新建立。
    if (trigger === null) {
      release()
      return
    }
    const previous = binding.current
    const ownerDocument = trigger.ownerDocument
    if (previous
      && previous.trigger === trigger
      && previous.ownerDocument === ownerDocument
      && Object.is(previous.openDelay, options.openDelay)
      && Object.is(previous.closeDelay, options.closeDelay)
      && Object.is(previous.buffer, options.buffer)) {
      return
    }

    release()
    const stop = trackHoverIntent({
      trigger,
      getContentEl: () => latest.current.getContentEl(),
      openDelay: options.openDelay,
      closeDelay: options.closeDelay,
      buffer: options.buffer,
      onOpenIntent: () => latest.current.onOpenIntent(),
      onCloseIntent: () => latest.current.onCloseIntent(),
    })
    binding.current = {
      trigger,
      ownerDocument,
      openDelay: options.openDelay,
      closeDelay: options.closeDelay,
      buffer: options.buffer,
      stop,
    }
  })

  useIsomorphicLayoutEffect(() => () => release(), [])
}

/** 观察滚动容器的位置与尺寸，值变了才回调。返回最近一次量到的值。 */
export function useScrollTracker(options: ScrollTrackerOptions): ScrollMetrics | null {
  const [metrics, setMetrics] = useState<ScrollMetrics | null>(null)
  const latest = useRef(options)
  latest.current = options
  useEffect(() => {
    const handle = createScrollTracker({
      ...latest.current,
      onChange: (next) => {
        setMetrics(next)
        latest.current.onChange?.(next)
      },
    })
    return () => handle.dispose()
  }, [])
  return metrics
}

export interface StickToBottom {
  /** 当前贴底状态，随原语的回调更新。 */
  state: StickToBottomState | null
  /** 滚到底部并恢复粘附，默认 'smooth'，reducedMotion 为真时强制 'instant'。 */
  scrollToBottom: (behavior?: 'smooth' | 'instant') => void
  /** 重新读取 scrollEl / contentEl，节点变了就解绑重绑。 */
  retarget: () => void
}

/**
 * 内容增长时保持贴底，用户往上滚过就松手不再跟。
 *
 * 原语在建好那一刻就绑一次，而首帧 ref 还是 null，所以每次提交后重读一遍节点：
 * 节点换了就解绑重绑，不重绑等于没挂上。
 */
export function useStickToBottom(options: StickToBottomOptions): StickToBottom {
  const [state, setState] = useState<StickToBottomState | null>(null)
  const latest = useRef(options)
  latest.current = options
  const handle = useRef<ReturnType<typeof createStickToBottom> | null>(null)

  useEffect(() => {
    handle.current = createStickToBottom({
      ...latest.current,
      onChange: (next) => {
        setState(next)
        latest.current.onChange?.(next)
      },
    })
    return () => {
      handle.current?.dispose()
      handle.current = null
    }
  }, [])

  // 不给依赖数组：每次提交后重读节点，换了就重绑
  const nodes = useRef<[Element | null, Element | null]>([null, null])
  useEffect(() => {
    const next: [Element | null, Element | null] = [latest.current.scrollEl(), latest.current.contentEl()]
    if (next[0] === nodes.current[0] && next[1] === nodes.current[1])
      return
    nodes.current = next
    handle.current?.retarget()
  })

  return {
    state,
    scrollToBottom: behavior => handle.current?.scrollToBottom(behavior),
    retarget: () => handle.current?.retarget(),
  }
}

/** 连续敲字母跳到匹配项的缓冲，超时自动清空。 */
export function useTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const [typeahead] = useState(() => createTypeahead(options))
  useEffect(() => () => typeahead.clear(), [typeahead])
  return typeahead
}
