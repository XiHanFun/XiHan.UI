/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Menu / ContextMenu / Menubar 共用的选择型条目原语。

export type MenuChoiceKind = 'item' | 'checkbox' | 'radio'

export type MenuRadioValue = Record<string, string>

export interface MenuChoiceItemProps {
  value: string
  disabled?: boolean
  /** 是否在激活后关闭所在菜单；普通命令默认 true，checkbox / radio 默认 false。 */
  closeOnSelect?: boolean
}

export interface MenuCheckboxItemProps extends MenuChoiceItemProps {}

export interface MenuRadioItemProps extends MenuChoiceItemProps {
  /** 所属 RadioGroup 的稳定身份。 */
  group: string
}

export interface MenuChoiceGroupProps {
  value: string
}

export interface MenuCheckboxValueChangeDetails {
  value: string[]
}

export interface MenuRadioValueChangeDetails {
  value: MenuRadioValue
}

/** 切换一枚 checkbox；顺序按首次勾选的先后保留。 */
export function toggleMenuCheckboxValue(current: readonly string[], value: string): string[] {
  return current.includes(value) ? current.filter(one => one !== value) : [...current, value]
}

/** 写入一组 radio 的值；同组只有一项。 */
export function setMenuRadioValue(current: Readonly<MenuRadioValue>, group: string, value: string): MenuRadioValue {
  if (!group)
    throw new RangeError('[xh] menu radio item 必须声明非空 group')
  if (current[group] === value)
    return current as MenuRadioValue
  return { ...current, [group]: value }
}

export function equalMenuRadioValue(a: Readonly<MenuRadioValue>, b: unknown): boolean {
  if (b == null || typeof b !== 'object' || Array.isArray(b))
    return false
  const right = b as MenuRadioValue
  const leftKeys = Object.keys(a)
  const rightKeys = Object.keys(right)
  return leftKeys.length === rightKeys.length && leftKeys.every(key => a[key] === right[key])
}

/** 普通命令缺省关闭；选择型条目缺省留在当前菜单中继续操作。 */
export function menuChoiceCloses(kind: MenuChoiceKind, closeOnSelect: boolean | undefined): boolean {
  return closeOnSelect ?? kind === 'item'
}
