/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use menu 相关实现。

import type { Service } from '@xihan-ui/core'
import type { MenuApi, MenuSchema, MenuTreeNode } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectMenu, createMenuTreeNode, menuMachine, menuOpensOnHover } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { computed, onBeforeUnmount, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface MenuContext {
  service: Service<MenuSchema>
  api: ComputedRef<MenuApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** Portal 之外的逻辑父子、悬停区域与选择收链由 headless 节点统一维护。 */
  tree: MenuTreeNode
  /** 当前是否应当渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层迁移到的位置：全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
  /**
   * 落点的视觉环境从哪取：缺省取 trigger；写了 anchor（哪怕暂时是 null）时为空，由 Portal 在 positioner 原位放来源标记。
   */
  portalSource: ComputedRef<Ref<HTMLElement | null> | undefined>
}

function useMenuImpl(
  props: MenuSchema['props'],
  onOpenChange?: MenuSchema['props']['onOpenChange'],
  onItemSelect?: MenuSchema['props']['onItemSelect'],
  onCheckboxValueChange?: MenuSchema['props']['onCheckboxValueChange'],
  onRadioValueChange?: MenuSchema['props']['onRadioValueChange'],
  treeParent?: MenuTreeNode,
): MenuContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  let service: Service<MenuSchema> | null = null
  const tree = createMenuTreeNode({
    getPositioner: () => positionerRef.value,
    isOpen: () => service?.state.get() === 'open',
    close: () => service?.send({ type: 'CLOSE' }),
    isRoot: () => !(service?.prop('submenu') ?? props.submenu),
    onRootSelect: details => onItemSelect?.(details),
  })
  service = useMachine(menuMachine, () => ({
    ...props,
    onOpenChange,
    onItemSelect: treeParent ? tree.select : onItemSelect,
    onCheckboxValueChange,
    onRadioValueChange,
  }), scope)
  const releaseParent = treeParent?.registerChild(tree)
  onBeforeUnmount(() => releaseParent?.())

  const api = computed(() => connectMenu(service, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const { visible, portalTarget } = useOverlay({
    scope,
    idGenerator: idGen,
    service,
    layer: () => ({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互；外部锚点同理，点它交给打开它的那条命令去切换。
      // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
      branches: () => [triggerRef.value, props.anchor, positionerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      // 悬停就展开的菜单（含子菜单）压在别的层上面不代表开在里面：只护着它开在其内容里的层
      opensOnHover: menuOpensOnHover(props),
    }),
    refs: () => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createDeferredPositionEngine())
      service.refs.set('getAnchorEl', () => triggerRef.value)
      service.refs.set('getFloatingEl', () => positionerRef.value)
      service.refs.set('getContentEl', () => contentRef.value)
      service.refs.set('getHoverBranches', tree.getHoverBranches)
    },
    isOpen: () => api.value.open,
    contentRef,
  })

  const portalSource = computed(() => (props.anchor !== undefined ? undefined : triggerRef))

  return { visible, service, api, triggerRef, positionerRef, contentRef, tree, portalTarget, portalSource }
}

/** 公开 composable：建立一棵独立菜单树。 */
export function useMenu(
  props: MenuSchema['props'],
  onOpenChange?: MenuSchema['props']['onOpenChange'],
  onItemSelect?: MenuSchema['props']['onItemSelect'],
  onCheckboxValueChange?: MenuSchema['props']['onCheckboxValueChange'],
  onRadioValueChange?: MenuSchema['props']['onRadioValueChange'],
): MenuContext {
  return useMenuImpl(props, onOpenChange, onItemSelect, onCheckboxValueChange, onRadioValueChange)
}

/** 组合部件内部入口：把子菜单连接到 headless 逻辑树。 */
export function useMenuWithParent(
  props: MenuSchema['props'],
  onOpenChange: MenuSchema['props']['onOpenChange'] | undefined,
  treeParent: MenuTreeNode,
  onCheckboxValueChange?: MenuSchema['props']['onCheckboxValueChange'],
  onRadioValueChange?: MenuSchema['props']['onRadioValueChange'],
): MenuContext {
  return useMenuImpl(props, onOpenChange, undefined, onCheckboxValueChange, onRadioValueChange, treeParent)
}
