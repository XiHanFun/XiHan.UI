/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 用户改过的顶部工具栏：用户的分组与先后为准，缺省排列里后来新有的命令补到缺省位置旁边，藏起的不显示。
// 用户数据里写了已经不存在的命令就跳过，不抛错；宿主 commandLayout 写错 id 仍由 arrangeCommands 抛错。

import type { DesignerSettings } from '../settings/model'
import { DESIGNER_SETTING_KEYS } from '../settings/model'

/** 用户改过的工具栏：groups 按用户的先后列出全部命令（含藏起的），藏起的写进 hidden；存在设置的 toolbar.layout 里。 */
export interface DesignerToolbarCustomization {
  readonly groups: readonly (readonly string[])[]
  readonly hidden?: readonly string[]
}

/** 设置里存的工具栏定制（toolbar.layout）；没写或形状不对时为 undefined。 */
export function toolbarCustomizationOf(settings: DesignerSettings | undefined): DesignerToolbarCustomization | undefined {
  const value = settings?.[DESIGNER_SETTING_KEYS.toolbarLayout]
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return undefined
  const { groups, hidden } = value as { groups?: unknown, hidden?: unknown }
  if (!Array.isArray(groups) || !groups.every(group => Array.isArray(group) && group.every(id => typeof id === 'string')))
    return undefined
  const kept = Array.isArray(hidden) ? hidden.filter((id): id is string => typeof id === 'string') : []
  return { groups: groups as string[][], ...(kept.length > 0 ? { hidden: kept } : {}) }
}

/**
 * 合起缺省排列与用户定制，列出全部命令（含藏起的）：用户的分组与先后为准，缺省排列里没有的命令去掉、重复的只留第一处；
 * 缺省排列里有、用户定制里没有的命令（后装的扩展）放在缺省排列里同组前面最近一条已放好的命令之后，没有就放在后面
 * 最近一条之前，整组都是新的就另起一组排在最后。没有定制时就是缺省排列。
 */
export function mergeToolbarCustomization(arranged: readonly (readonly string[])[], customization: DesignerToolbarCustomization | undefined): string[][] {
  if (customization === undefined)
    return arranged.map(group => [...group])
  const known = new Set(arranged.flat())
  const placed = new Set<string>()
  const groups = customization.groups.map(group => group.filter((id) => {
    if (!known.has(id) || placed.has(id))
      return false
    placed.add(id)
    return true
  }))
  for (const group of arranged) {
    group.forEach((id, index) => {
      if (placed.has(id))
        return
      const before = group.slice(0, index).reverse().find(other => placed.has(other))
      const after = group.slice(index + 1).find(other => placed.has(other))
      const anchor = before ?? after
      if (anchor === undefined) {
        groups.push([id])
      }
      else {
        const target = groups.find(item => item.includes(anchor))!
        target.splice(target.indexOf(anchor) + (before === undefined ? 0 : 1), 0, id)
      }
      placed.add(id)
    })
  }
  return groups.filter(group => group.length > 0)
}

/**
 * 按用户的定制排顶部工具栏：arranged 是 arrangeCommands('toolbar', …) 排好的分组，customization 取 toolbarCustomizationOf(settings)。
 * 先按 mergeToolbarCustomization 合起来，再去掉藏起的命令与空组。
 */
export function applyToolbarCustomization(arranged: readonly (readonly string[])[], customization: DesignerToolbarCustomization | undefined): string[][] {
  const hidden = new Set(customization?.hidden ?? [])
  return mergeToolbarCustomization(arranged, customization)
    .map(group => group.filter(id => !hidden.has(id)))
    .filter(group => group.length > 0)
}
