import type { PropertyDeclarations } from '../reactive'
import type { AnchoredPortalControllerOptions } from './anchored-portal-controller'
import type { PortalLeaseControllerOptions } from './portal-lease-controller'
import { resolveXhConfig } from '../config'
import { XhElement } from '../element-base'
import { AnchoredPortalController } from './anchored-portal-controller'
import { PortalLeaseController } from './portal-lease-controller'

export type PortalContainerResolver = () => Element | null

/**
 * 只供真正物理 Portal 宿主继承；普通 XhElement（包括 NavigationMenu）不公开此能力。
 * property 响应式由基类统一声明，实例变化会自然触发各宿主既有 wire/sync。
 */
export abstract class XhPortalHostElement extends XhElement {
  static override properties: PropertyDeclarations = {
    portalContainer: { attribute: false },
  }

  /** 本实例的 Portal 目标解析器；显式设置后不回退 xh-config 或 RuntimeConfig。 */
  declare portalContainer?: PortalContainerResolver

  protected createPortalLeaseController(
    options: Omit<PortalLeaseControllerOptions, 'portalContainer'>,
  ): PortalLeaseController {
    return new PortalLeaseController({
      ...options,
      portalContainer: () => this.portalContainer ?? resolveXhConfig(this).portalContainer,
    })
  }

  protected createAnchoredPortalController(
    options: Omit<AnchoredPortalControllerOptions, 'portalContainer'>,
  ): AnchoredPortalController {
    return new AnchoredPortalController({
      ...options,
      portalContainer: () => this.portalContainer ?? resolveXhConfig(this).portalContainer,
    })
  }
}
