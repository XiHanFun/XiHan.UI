import type { Cleanup, PortalLease, RuntimeConfig } from '@xihan-ui/core'
import { createPortalLease } from '@xihan-ui/core'

export interface PortalLeaseControllerOptions {
  /** 诊断中的组件名。 */
  name: string
  /** 当前宿主所属 Document 的 RuntimeConfig。 */
  config: () => RuntimeConfig | null
  /** 实例或 xh-config 声明的 Portal 容器解析器；缺席时才回落 RuntimeConfig。 */
  portalContainer?: () => (() => Element | null) | undefined
  /** Portal 视觉环境的逻辑来源。 */
  source: () => Element | null
  /** 同一租约原子搬迁的根。 */
  roots: () => readonly HTMLElement[]
  /** 根搬迁前建立适配器逻辑所有权；清理在根归位后执行。 */
  onShellReady?: (shell: HTMLElement) => Cleanup | void
  /** 租约换代后让 XhElement 重建外部部件发现与 MutationObserver。 */
  onChange: () => void
}

/**
 * Web Components 对 Core PortalLease 的共享生命周期接线。
 * placeholder、独占壳、视觉桥、事务回滚与精确归位仍全部由 Core 持有。
 */
export class PortalLeaseController {
  private lease: PortalLease | null = null

  constructor(private readonly options: PortalLeaseControllerOptions) {}

  /** XhElement 用它继续发现已经搬到宿主外的全部角色节点。 */
  get roots(): readonly HTMLElement[] {
    return this.lease?.roots ?? []
  }

  /** Presence 仍可见时持有租约；退场完成或必要节点缺席时精确归位。 */
  sync(active: boolean): void {
    const source = this.options.source()
    const roots = this.options.roots()
    if (!active || !source || !roots.length) {
      if (this.release())
        this.options.onChange()
      return
    }

    const target = this.resolveTarget()

    if (
      this.lease?.source === source
      && this.lease.target === target
      && roots.length === this.lease.roots.length
      && roots.every((root, index) => root === this.lease!.roots[index])
    ) {
      return
    }

    this.release()
    this.lease = createPortalLease({ source, target, roots, onShellReady: this.options.onShellReady })
    this.options.onChange()
  }

  /** 宿主断开或 realm 换代时立即归位；Core 的 release 自身幂等。 */
  dispose(): void {
    this.release()
  }

  private release(): boolean {
    const lease = this.lease
    if (!lease)
      return false
    this.lease = null
    lease.release()
    return true
  }

  private resolveTarget(): Element {
    const resolver = this.options.portalContainer?.() ?? this.options.config()?.portalContainer
    let target: Element | null | undefined
    try {
      target = resolver?.()
    }
    catch (error) {
      if (this.release())
        this.options.onChange()
      throw error
    }
    if (target)
      return target
    if (this.release())
      this.options.onChange()
    throw new Error(`[xh] ${this.options.name} 的 portalContainer 必须返回已连接的同 Document Element`)
  }
}
