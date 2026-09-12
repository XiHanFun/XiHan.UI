import type { PortalLease, RuntimeConfig } from '@xihan-ui/core'
import { createPortalLease } from '@xihan-ui/core'

export interface AnchoredPortalControllerOptions {
  /** 诊断中的组件名。 */
  name: string
  /** 当前宿主所属 Document 的 RuntimeConfig。 */
  config: () => RuntimeConfig | null
  /** 视觉环境来源，通常是 trigger；组合输入使用 control。 */
  source: () => Element | null
  /** 被物理搬迁的 positioner 根。 */
  root: () => HTMLElement | null
  /** 租约换代后让 XhElement 重建外部部件发现与 MutationObserver。 */
  onChange: () => void
}

/**
 * 锚定浮层的 Web Components 共享 Portal 接线。
 * placeholder、独占壳、视觉桥、事务回滚与精确归位全部由 Core PortalLease 持有。
 */
export class AnchoredPortalController {
  private lease: PortalLease | null = null

  constructor(private readonly options: AnchoredPortalControllerOptions) {}

  /** XhElement 用它继续发现已经搬到宿主外的全部角色节点。 */
  get roots(): readonly HTMLElement[] {
    return this.lease?.roots ?? []
  }

  /** Presence 仍可见时持有租约；退场完成或必要节点缺席时精确归位。 */
  sync(active: boolean): void {
    const source = this.options.source()
    const root = this.options.root()
    if (!active || !source || !root) {
      if (this.release())
        this.options.onChange()
      return
    }

    const config = this.options.config()
    const target = config?.portalContainer()
    if (!target)
      throw new Error(`[xh] ${this.options.name} 锚定浮层需要显式可用的 Portal 容器`)

    if (this.lease?.source === source && this.lease.target === target && this.lease.roots[0] === root)
      return

    this.release()
    this.lease = createPortalLease({ source, target, roots: [root] })
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
}
