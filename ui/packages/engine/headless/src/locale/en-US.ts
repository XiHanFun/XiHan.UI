/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 英文语言包。

import type { XhLocale } from './types'

/**
 * 英文。内建文案本来就是英文，这里不再抄一份：只带 locale，文案一律走组件自己的缺省。
 * 运行时从别的语言切回英文时用它。
 */
export const enUS: XhLocale = { locale: 'en-US', translations: {} }
