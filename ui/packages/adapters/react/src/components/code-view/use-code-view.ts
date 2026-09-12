import type { HighlighterPort } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewProps } from '@xihan-ui/headless'
import { connectCodeView, createCodeViewHighlighterResource } from '@xihan-ui/headless'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'

const defaultHighlighter = createCodeViewHighlighterResource(() => import('@xihan-ui/code-highlight'))

/** 服务端没有这一次异步加载，快照恒为 null，与客户端首帧对齐。 */
function readOnServer(): HighlighterPort | null {
  return null
}

function subscribeNone(): () => void {
  return () => {}
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

/** 默认着色实现；模块到达后本组件重渲一次。显式实现或 null 不请求可选 peer。 */
export function useDefaultHighlighter(enabled: boolean): HighlighterPort | null {
  if (enabled)
    defaultHighlighter.request()
  return useSyncExternalStore(
    enabled ? defaultHighlighter.subscribe : subscribeNone,
    enabled ? defaultHighlighter.read : readOnServer,
    readOnServer,
  )
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
