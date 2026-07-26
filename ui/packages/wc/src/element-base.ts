import type { Spreader } from './dom/spread'
import { ReactiveElement } from '@lit/reactive-element'
import { discoverParts } from './dom/parts'
import { createSpreader } from './dom/spread'

// Light-DOM 行为宿主基类：不渲染结构，发现用户写的 data-xh-part 角色节点并往上打属性/事件。
export abstract class XhElement extends ReactiveElement {
  protected readonly spreader: Spreader = createSpreader()
  protected partMap: Map<string, HTMLElement[]> = new Map()

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this // Light DOM，不建 shadowRoot
  }

  // 命名避开 HTMLElement.part（shadow part 属性），改用 getPart/getParts。
  protected getPart(name: string, index = 0): HTMLElement | null {
    return this.partMap.get(name)?.[index] ?? null
  }

  protected getParts(name: string): HTMLElement[] {
    return this.partMap.get(name) ?? []
  }

  protected refreshParts(): void {
    this.partMap = discoverParts(this as unknown as HTMLElement)
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed)
    this.refreshParts()
    this.wire()
  }

  /** 子类实现：把 connect 产出打到角色节点上。 */
  protected abstract wire(): void
}
