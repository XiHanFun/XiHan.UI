import type { HighlighterPort } from '@xihan-ui/core'

const DEFAULT_HIGHLIGHTER_MODULE = '@xihan-ui/code-highlight'
const MISSING_MODULE_CODES = new Set(['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'])
const MISSING_MODULE_MESSAGES = [
  'Cannot find package',
  'Cannot find module',
  'Failed to resolve module specifier',
]

export interface CodeViewHighlighterModule {
  createHighlighter: () => HighlighterPort
}

export type CodeViewHighlighterLoader = () => Promise<CodeViewHighlighterModule>

export interface CodeViewHighlighterResource {
  /** 幂等触发一次模块请求；实例显式关闭默认高亮时不应调用。 */
  request: () => void
  /** 当前默认实现；模块缺席时为 null，加载或初始化失败时抛出原始异常。 */
  read: () => HighlighterPort | null
  /** 实现到达、确认缺席或失败时通知；框架适配器据此接各自响应式更新。 */
  subscribe: (listener: () => void) => () => void
}

/**
 * 只把明确指向默认可选 peer 的解析失败判为“能力未安装”。
 * 网络、模块求值和实现初始化异常不能被降级成纯文本。
 */
export function isCodeViewHighlighterUnavailable(error: unknown): boolean {
  const seen = new Set<unknown>()
  let current = error
  while (current instanceof Error && !seen.has(current)) {
    seen.add(current)
    const message = current.message
    const code = (current as Error & { code?: unknown }).code
    if (message.includes(DEFAULT_HIGHLIGHTER_MODULE)
      && ((typeof code === 'string' && MISSING_MODULE_CODES.has(code))
        || MISSING_MODULE_MESSAGES.some(pattern => message.includes(pattern)))) {
      return true
    }
    current = (current as Error & { cause?: unknown }).cause
  }
  return false
}

/**
 * 默认高亮器的异步资源真源。模块 loader 留在适配器，Headless 不反向依赖可选 feature；
 * 请求去重、结果缓存、订阅和失败边界只在这里实现一次。
 */
export function createCodeViewHighlighterResource(
  loadModule: CodeViewHighlighterLoader,
): CodeViewHighlighterResource {
  type State = 'idle' | 'loading' | 'ready' | 'unavailable' | 'failed'

  let state: State = 'idle'
  let highlighter: HighlighterPort | null = null
  let failure: unknown
  const listeners = new Set<() => void>()

  const notify = (): void => {
    for (const listener of listeners)
      listener()
  }

  return {
    request: () => {
      if (state !== 'idle')
        return
      state = 'loading'
      void loadModule().then(
        (module) => {
          try {
            highlighter = module.createHighlighter()
            state = 'ready'
          }
          catch (error) {
            failure = error
            state = 'failed'
          }
          notify()
        },
        (error: unknown) => {
          if (isCodeViewHighlighterUnavailable(error)) {
            state = 'unavailable'
          }
          else {
            failure = error
            state = 'failed'
          }
          notify()
        },
      )
    },
    read: () => {
      if (state === 'failed')
        throw failure
      return highlighter
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
