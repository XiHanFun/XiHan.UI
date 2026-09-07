import type { HighlighterPort } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewProps } from '@xihan-ui/headless'
import { connectCodeView } from '@xihan-ui/headless'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'

/**
 * 默认着色实现全组件共用一份：它无状态，没必要每块代码建一个。
 *
 * `@xihan-ui/code-highlight` 是可选 peer：装了它，模块到达后这里落成它的实现，
 * 在场的代码视图重渲一次并着色；没装则一直是 null，代码按纯文本渲染。
 */
let defaultHighlighter: HighlighterPort | null = null

/** 模块只载一次。 */
let requested = false

/** 落地之后要叫醒的那几个组件。 */
const listeners = new Set<() => void>()

/** 首次用到时才去载默认着色实现；载不到就保持 null。 */
function requestDefaultHighlighter(): void {
  if (requested)
    return
  requested = true
  void import('@xihan-ui/code-highlight')
    .then((module) => {
      defaultHighlighter = module.createHighlighter()
      for (const notify of listeners) notify()
    })
    .catch(() => {})
}

function subscribe(notify: () => void): () => void {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

function readDefaultHighlighter(): HighlighterPort | null {
  return defaultHighlighter
}

/** 服务端没有这一次异步加载，快照恒为 null，与客户端首帧对齐。 */
function readOnServer(): HighlighterPort | null {
  return null
}

export interface CodeViewContext {
  api: CodeViewApi
  /**
   * 登记一份渲出来的 filename 部件，返回撤销登记的函数。
   * pre 的可访问名据此决定指过去还是用文案兜底——看 filename 这个 prop 有没有值是不够的，
   * 传了值却没写节点时 aria-labelledby 会指向一个不存在的 id。
   */
  registerFilename: () => () => void
}

/** 默认着色实现；模块到达后本组件重渲一次。 */
export function useDefaultHighlighter(): HighlighterPort | null {
  requestDefaultHighlighter()
  return useSyncExternalStore(subscribe, readDefaultHighlighter, readOnServer)
}

// 无状态机，只用一份实例级 scope 派生 part id；props 与登记数变了由重渲重算属性
export function useCodeView(props: CodeViewProps): CodeViewContext {
  const scope = useReactScope()
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [filenameCount, setFilenameCount] = useState(0)
  const registerFilename = useCallback(() => {
    setFilenameCount(n => n + 1)
    return () => setFilenameCount(n => n - 1)
  }, [])
  const api = connectCodeView({ ...props, labelled: filenameCount > 0 }, scope, reactNormalize)
  return { api, registerFilename }
}
