// 全局诊断通道：组件把「这里不对」投递进来，宿主订阅后自行决定打印、收集还是上报。
import type { Cleanup } from '../types'
import type { DiagnosticHandler, DiagnosticRecord, Diagnostics, DiagnosticThreshold } from './types'
import { isDev } from '../utils/dev'

const GLOBAL_KEY = '__XIHAN_UI_DIAGNOSTICS__'

const RANK: Record<DiagnosticThreshold, number> = { silent: 0, error: 1, warn: 2 }

/** 去重记录的容量上限，超出即整体清空，避免长跑进程无界增长。 */
const SEEN_LIMIT = 1000

// 文案参与取键：同一 code 下不同文案是不同的问题，只有逐帧重复的同一条才该被压掉。
function dedupeKey(record: DiagnosticRecord): string {
  return `${record.code}|${record.scope ?? ''}|${record.instanceId ?? ''}|${record.part ?? ''}|${record.message}`
}

function formatPrefix(record: DiagnosticRecord): string {
  const parts = ['xh']
  if (record.scope)
    parts.push(record.scope)
  return `[${parts.join(':')}]`
}

function writeConsole(record: DiagnosticRecord): void {
  const head = `${formatPrefix(record)} ${record.message} (${record.code})`
  const rest: unknown[] = []
  if (record.node)
    rest.push(record.node)
  if (record.detail)
    rest.push(record.detail)
  if (record.level === 'error')
    console.error(head, ...rest)
  else
    console.warn(head, ...rest)
}

function createDiagnostics(): Diagnostics {
  const handlers = new Set<DiagnosticHandler>()
  const seen = new Set<string>()
  const defaults = { level: (isDev() ? 'warn' : 'silent') as DiagnosticThreshold, dedupe: true, consoleOutput: isDev() }
  let level = defaults.level
  let dedupe = defaults.dedupe
  let consoleOutput = defaults.consoleOutput

  const report: Diagnostics['report'] = (record) => {
    if (RANK[record.level] > RANK[level])
      return
    if (dedupe) {
      const key = dedupeKey(record)
      if (seen.has(key))
        return
      if (seen.size >= SEEN_LIMIT)
        seen.clear()
      seen.add(key)
    }
    if (consoleOutput)
      writeConsole(record)
    // 订阅方抛错不得回流进组件
    for (const handler of Array.from(handlers)) {
      try {
        handler(record)
      }
      catch {}
    }
  }

  const subscribe: Diagnostics['subscribe'] = (handler) => {
    handlers.add(handler)
    const off: Cleanup = () => {
      handlers.delete(handler)
    }
    return off
  }

  return {
    report,
    subscribe,
    setLevel: (next) => {
      level = next
    },
    getLevel: () => level,
    setDedupe: (on) => {
      dedupe = on
      if (!on)
        seen.clear()
    },
    setConsoleOutput: (on) => {
      consoleOutput = on
    },
    reset: () => {
      handlers.clear()
      seen.clear()
      level = defaults.level
      dedupe = defaults.dedupe
      consoleOutput = defaults.consoleOutput
    },
  }
}

/** 取全局唯一通道；挂在 globalThis 上，同页面多份副本共用一条。 */
export function getDiagnostics(): Diagnostics {
  const g = globalThis as unknown as Record<string, Diagnostics | undefined>
  return (g[GLOBAL_KEY] ??= createDiagnostics())
}

export function reportDiagnostic(record: DiagnosticRecord): void {
  getDiagnostics().report(record)
}

export function onDiagnostic(handler: DiagnosticHandler): Cleanup {
  return getDiagnostics().subscribe(handler)
}

export function setDiagnosticsLevel(level: DiagnosticThreshold): void {
  getDiagnostics().setLevel(level)
}

export function setDiagnosticsDedupe(on: boolean): void {
  getDiagnostics().setDedupe(on)
}

export function setDiagnosticsConsoleOutput(on: boolean): void {
  getDiagnostics().setConsoleOutput(on)
}

export function resetDiagnostics(): void {
  getDiagnostics().reset()
}
