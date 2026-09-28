/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 「更多」菜单：一排条目放不下时，行尾一颗钮弹出的那张 Menu。Toolbar 与 Tabs 共用。
//
// 哪些条目进菜单由各组件自己量（工具条收起尾部、标签带列出可见区外的标签），
// 这里只管两件共同的事：条目在菜单里叫什么（按读屏取可及名的先后），以及菜单的机器 props 怎样拼。
// 只在挂载后的效应与事件处理器里读 DOM，渲染期不得调用 overflowItemLabel。

import type { Direction, Orientation, Placement, Size } from '@xihan-ui/core'
import type { MenuNode, MenuSchema } from '../menu/menu.types'

/** 空白折成一个空格再去掉两端：条目里的图标与换行不该把菜单文字撑出空洞。 */
function tidy(text: string | null | undefined): string {
  return (text ?? '').split(/\s+/u).filter(Boolean).join(' ')
}

/**
 * 条目的可及名，按读屏取名的先后：aria-label、aria-labelledby 指向的文字、自己的文字、title。
 * 都没有时返回空串，由调用方决定退回什么（身份值、数据里的文字）。
 */
export function overflowItemLabel(el: HTMLElement): string {
  const label = tidy(el.getAttribute('aria-label'))
  if (label)
    return label
  const ids = tidy(el.getAttribute('aria-labelledby'))
  if (ids) {
    const text = ids.split(' ')
      .map(id => tidy(el.ownerDocument.getElementById(id)?.textContent))
      .filter(Boolean)
      .join(' ')
    if (text)
      return text
  }
  return tidy(el.textContent) || tidy(el.getAttribute('title'))
}

/** 菜单里的一项。 */
export interface OverflowMenuEntry {
  value: string
  label: string
  disabled: boolean
  /** 开关条目的按下态，菜单里显示为勾选项；普通条目为 null。 */
  checked: boolean | null
  /** 与上一项之间隔着分组边界，菜单在两者之间画一条分隔线。 */
  separatorBefore: boolean
}

export interface OverflowMenuOptions {
  entries: readonly OverflowMenuEntry[]
  /** 条目那一排的主轴：决定菜单贴在钮的哪一侧。 */
  orientation: Orientation
  dir: Direction | undefined
  size: Size | undefined
  disabled?: boolean
  /** 选中一项：由组件替那个条目完成它的动作。 */
  onSelect: (value: string) => void
}

/**
 * 「更多」菜单的落位：横排贴在钮下方、与钮的结束缘对齐，菜单往行首方向长，不伸出那一排的尾端；
 * 竖排贴在钮的侧面、与钮的底缘对齐，往上长。
 */
function overflowPlacement(orientation: Orientation, dir: Direction | undefined): Placement {
  if (orientation !== 'vertical')
    return 'bottom-end'
  return dir === 'rtl' ? 'left-end' : 'right-end'
}

/**
 * 「更多」菜单的机器 props。条目选完即收起，勾选项同样选完就收。
 * 一项都没有（全部放得下、钮已收起）时菜单受控关着：开着的菜单随之收起，不会剩一张空菜单浮在收起的钮旁边；
 * 有条目时交回菜单自己开合。
 */
export function overflowMenuProps(options: OverflowMenuOptions): MenuSchema['props'] {
  const { entries } = options
  const collection: MenuNode[] = entries.map(entry => ({
    value: entry.value,
    label: entry.label,
    disabled: entry.disabled,
    kind: entry.checked == null ? 'item' : 'checkbox',
    separatorBefore: entry.separatorBefore,
    closeOnSelect: true,
  }))
  return {
    collection,
    open: entries.length === 0 ? false : undefined,
    checkboxValue: entries.filter(entry => entry.checked === true).map(entry => entry.value),
    placement: overflowPlacement(options.orientation, options.dir),
    dir: options.dir,
    size: options.size,
    disabled: options.disabled,
    onSelect: ({ value }) => options.onSelect(value),
  }
}
