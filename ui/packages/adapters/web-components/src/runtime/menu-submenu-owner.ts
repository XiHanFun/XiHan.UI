import type { Cleanup } from '@xihan-ui/core'
import type { MenuSelectDetails } from '@xihan-ui/headless'

export interface MenuSubmenuChild {
  readonly trigger: HTMLElement
  readonly getPositioner: () => HTMLElement | null
  readonly getHoverBranches: () => readonly HTMLElement[]
  readonly isOpen: () => boolean
  readonly getDisabled: () => boolean | undefined
}

export interface MenuSubmenuRegistration {
  /** 父机在子机属性之后重铺一次，确保跨 scope 的父 item 身份胜出。 */
  sync: () => void
  /** 叶层已收起后，把选择沿逻辑链逐层交给根。 */
  select: (details: MenuSelectDetails) => void
  dispose: Cleanup
}

export interface MenuSubmenuOwner {
  registerSubmenu: (child: MenuSubmenuChild) => MenuSubmenuRegistration
}

const owners = new WeakMap<Element, MenuSubmenuOwner>()

export function setMenuSubmenuOwner(element: Element, owner: MenuSubmenuOwner | null): void {
  if (owner)
    owners.set(element, owner)
  else
    owners.delete(element)
}

/** 沿真实祖先或 Portal 壳找最近逻辑菜单宿主，不按标签名猜测。 */
export function findMenuSubmenuOwner(element: Element): MenuSubmenuOwner | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const owner = owners.get(node)
    if (owner)
      return owner
  }
  return null
}
