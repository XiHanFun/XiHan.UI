/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标签页的「更多」下拉：标签带放不下时，行尾一颗钮弹出一张 Menu，列出此刻没有整个露在可见区里的标签。
//
// 与 Toolbar 的「更多」菜单是同一套：菜单的机器 props 与条目取名走 shared/overflow-menu，
// 窗口判定走 core 的 overflowOutsideWindow。不同在于标签不收起——标签带整条沿主轴位移，
// 可见区随位移走，下拉里的那几项也随之换；标签始终留在标签带与 tablist 里。
// 只在挂载后的效应与事件处理器里读 DOM，渲染期不得调用。

import type { Service } from '@xihan-ui/core'
import type { MenuSchema } from '../menu/menu.types'
import type { TabsOverflowItem, TabsSchema } from './tabs.types'
import { isItemDisabled, itemValue } from '@xihan-ui/core'
import { overflowItemLabel, overflowMenuProps } from '../shared/overflow-menu'

/** 标签在下拉里的样子：文字、禁用一律从标签当下的 DOM 读；可及名都没有时取数据里的文字，再没有取身份值。 */
export function describeOverflowTab(el: HTMLElement, collectionLabel: (value: string) => string | undefined): TabsOverflowItem {
  const value = itemValue(el) ?? ''
  return {
    value,
    label: overflowItemLabel(el) || collectionLabel(value) || value,
    disabled: isItemDisabled(el),
  }
}

/** 两轮结果是否一样：作 cell 的 isEqual 用，量到同一结果不多推一次更新。 */
export function sameTabsOverflowItems(a: readonly TabsOverflowItem[], b: unknown): boolean {
  if (!Array.isArray(b) || a.length !== b.length)
    return false
  return a.every((item, index) => {
    const other = b[index] as TabsOverflowItem
    return item.value === other.value && item.label === other.label && item.disabled === other.disabled
  })
}

/**
 * 「更多」下拉的机器 props，从标签页的机器现读：下拉里是可见区外的标签，选中一项即选中那个标签并把它挪进可见区，
 * 下拉随之收起、焦点回到钮上。落位、选完收起与「一项都没有时受控关着」归共用的 overflowMenuProps。
 * 三端都用它喂菜单：Vue / React 交给 XhMenuRoot，Web Components 交给元素内自建的菜单机器。
 */
export function tabsOverflowMenuProps(service: Service<TabsSchema>): MenuSchema['props'] {
  const { context, prop, send } = service
  return overflowMenuProps({
    entries: context.get('overflowItems').map(item => ({
      value: item.value,
      label: item.label,
      disabled: item.disabled,
      checked: null,
      separatorBefore: false,
    })),
    orientation: prop('orientation') ?? 'horizontal',
    dir: prop('dir'),
    size: prop('size'),
    onSelect: value => send({ type: 'OVERFLOW.SELECT', value }),
  })
}
