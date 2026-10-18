/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-shell/locale —— 设计器零件的内建文案，语言与 UI 的内建语言包一一对应。
//
// 各产品把对应语言的这一份并进自己的语言包，宿主只合并一份产品包。每种语言是独立的具名导出，
// 打包器按引用摇树，只留下用到的那几份。英文与零件不配语言包时的缺省文案相同。

import type {} from '../translations'

export { designerShellDeDE } from './de-DE'
export { designerShellEnUS } from './en-US'
export { designerShellEsES } from './es-ES'
export { designerShellFrFR } from './fr-FR'
export { designerShellJaJP } from './ja-JP'
export { designerShellKoKR } from './ko-KR'
export { designerShellPtBR } from './pt-BR'
export { designerShellRuRU } from './ru-RU'
export { designerShellZhCN } from './zh-CN'
export { designerShellZhTW } from './zh-TW'
