// 诊断通道的类型契约。
import type { Cleanup } from '../types'

export type DiagnosticLevel = 'error' | 'warn'

/** 放行阈值，silent 丢弃全部记录。 */
export type DiagnosticThreshold = DiagnosticLevel | 'silent'

export interface DiagnosticRecord {
  /** 稳定标识，形如 `wc.missing-part`；订阅方据它分流，不随文案变化。 */
  readonly code: string
  readonly level: DiagnosticLevel
  /** 面向开发者的说明。 */
  readonly message: string
  /** 组件 scope，取 anatomy 名。 */
  readonly scope?: string
  /** 组件实例 id，区分同一组件的多个实例。 */
  readonly instanceId?: string
  /** 涉及的 part 名。 */
  readonly part?: string
  /** 涉及的节点。 */
  readonly node?: Element
  /** 附加数据。 */
  readonly detail?: Readonly<Record<string, unknown>>
}

export type DiagnosticHandler = (record: DiagnosticRecord) => void

export interface Diagnostics {
  /** 投递一条记录；低于阈值、或去重命中时丢弃。 */
  report: (record: DiagnosticRecord) => void
  /** 订阅记录，返回退订。 */
  subscribe: (handler: DiagnosticHandler) => Cleanup
  setLevel: (level: DiagnosticThreshold) => void
  getLevel: () => DiagnosticThreshold
  /** 同一 code + scope + instanceId + part 是否只报一次。 */
  setDedupe: (on: boolean) => void
  /** 内建 console 输出开关。 */
  setConsoleOutput: (on: boolean) => void
  /** 清空订阅者、去重记录与全部开关，恢复默认。 */
  reset: () => void
}
