/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/headless/locale —— 内建语言包。
//
// 与主入口分开：每份语言包都是一整张文案表，只用一种语言的应用不该把其余几种也压进主入口。
// 各包是独立的具名导出，打包器按引用摇树，只留下用到的那几份。

export { deDE } from './de-DE'
export { enUS } from './en-US'
export { esES } from './es-ES'
export { frFR } from './fr-FR'
export { jaJP } from './ja-JP'
export { koKR } from './ko-KR'
export { ptBR } from './pt-BR'
export { ruRU } from './ru-RU'
export type { XhLocale } from './types'
export { zhCN } from './zh-CN'
export { zhTW } from './zh-TW'
