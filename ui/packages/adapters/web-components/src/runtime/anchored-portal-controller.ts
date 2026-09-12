import type { Cleanup, RuntimeConfig } from '@xihan-ui/core'
import { PortalLeaseController } from './portal-lease-controller'

export interface AnchoredPortalControllerOptions {
  /** 诊断中的组件名。 */
  name: string
  /** 当前宿主所属 Document 的 RuntimeConfig。 */
  config: () => RuntimeConfig | null
  /** 实例或 xh-config 声明的 Portal 容器解析器；缺席时才回落 RuntimeConfig。 */
  portalContainer?: () => (() => Element | null) | undefined
  /** 视觉环境来源，通常是 trigger；组合输入使用 control。 */
  source: () => Element | null
  /** 被物理搬迁的 positioner 根。 */
  root: () => HTMLElement | null
  /** 根搬迁前建立适配器逻辑所有权；清理在根归位后执行。 */
  onShellReady?: (shell: HTMLElement) => Cleanup | void
  /** 租约换代后让 XhElement 重建外部部件发现与 MutationObserver。 */
  onChange: () => void
}

/**
 * 锚定浮层的 Web Components 共享 Portal 接线。
 * placeholder、独占壳、视觉桥、事务回滚与精确归位全部由 Core PortalLease 持有。
 */
export class AnchoredPortalController {
  private readonly portal: PortalLeaseController

  constructor(options: AnchoredPortalControllerOptions) {
    this.portal = new PortalLeaseController({
      ...options,
      roots: () => {
        const root = options.root()
        return root ? [root] : []
      },
    })
  }

  /** XhElement 用它继续发现已经搬到宿主外的全部角色节点。 */
  get roots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  /** Presence 仍可见时持有租约；退场完成或必要节点缺席时精确归位。 */
  sync(active: boolean): void {
    this.portal.sync(active)
  }

  /** 宿主断开或 realm 换代时立即归位；Core 的 release 自身幂等。 */
  dispose(): void {
    this.portal.dispose()
  }
}
