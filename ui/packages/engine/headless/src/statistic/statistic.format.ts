/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 统计数值的格式化：按语言交给 Intl.NumberFormat，选项原样转交，不另加默认值。
// 纯字符串处理，不认识 DOM。

/** 格式化器缓存：每次渲染都要算一遍文字，同一组语言与选项不必反复新建 Intl.NumberFormat。 */
const formatters = new Map<string, Intl.NumberFormat>()

function formatterOf(locale: string, options: Intl.NumberFormatOptions | undefined): Intl.NumberFormat {
  const key = `${locale}|${options === undefined ? '' : JSON.stringify(options)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    formatters.set(key, formatter)
  }
  return formatter
}

/**
 * 按语言与选项铺出一个数。分组、小数位、货币与单位都照 Intl 的规则走：
 * 不写选项时分组打开、至多三位小数；非有限数照 Intl 的写法输出（NaN、∞），不替作者改成 0。
 * 选项或语言标记不合法时 Intl 当场抛 RangeError。
 */
export function formatStatisticValue(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  return formatterOf(locale, options).format(value)
}
