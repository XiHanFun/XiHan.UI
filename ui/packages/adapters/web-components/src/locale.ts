/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/web-components/locale —— 内建语言包，从 headless 转发，应用不必另装依赖。
//
// 与主入口分开：每份语言包都是一整张文案表，按需引入、按引用摇树。
// 一份语言包就是一份全局配置，直接交给 setXhConfig；还要配别的项时先合并：
//   setXhConfig(zhCN)
//   setXhConfig({ ...zhCN, size: 'sm' })

export { deDE, enUS, esES, frFR, jaJP, koKR, ptBR, ruRU, zhCN, zhTW } from '@xihan-ui/headless/locale'
export type { XhLocale } from '@xihan-ui/headless/locale'
