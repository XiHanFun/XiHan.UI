/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// IANA 时区候选与检索。交互本身复用 Combobox，这里只负责领域数据。

import type { TimeZoneSelectOption } from './time-zone-select.types'
import { canonicalizeTimeZone, formatTimeZoneOffset, getAvailableTimeZones, getTimeZoneOffset } from '@xihan-ui/core/date'

export interface CreateTimeZoneOptions {
  timeZones?: readonly string[]
  referenceTime?: Date | number
  locale?: string
}

function searchKey(value: string, locale?: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[_/+-]+/g, ' ')
    .toLocaleLowerCase(locale)
    .replace(/\s+/g, ' ')
    .trim()
}

/** 构造稳定候选：同一时区别名只保留一条，显示 IANA 名与参考时刻下的 UTC 偏移。 */
export function createTimeZoneOptions(config: CreateTimeZoneOptions = {}): readonly TimeZoneSelectOption[] {
  const instant = config.referenceTime ?? Date.now()
  const seen = new Set<string>()
  const options: TimeZoneSelectOption[] = []
  for (const input of config.timeZones ?? getAvailableTimeZones()) {
    const value = canonicalizeTimeZone(input)
    if (seen.has(value))
      continue
    seen.add(value)
    const offsetMilliseconds = getTimeZoneOffset(instant, value)
    const offset = formatTimeZoneOffset(offsetMilliseconds)
    const city = value.split('/').at(-1)?.replaceAll('_', ' ') ?? value
    options.push({
      value,
      label: value,
      description: `UTC${offset} · ${city}`,
      offsetMilliseconds,
      offset,
      searchText: searchKey(`${value} ${city} UTC${offset}`, config.locale),
    })
  }
  const collator = new Intl.Collator(config.locale, { usage: 'sort', sensitivity: 'base' })
  options.sort((a, b) => collator.compare(a.label, b.label))
  return Object.freeze(options.map(option => Object.freeze(option)))
}

/** 按 IANA 名、城市片段或 UTC 偏移检索；空串返回原集合。 */
export function filterTimeZoneOptions(
  options: readonly TimeZoneSelectOption[],
  query: string,
  locale?: string,
): TimeZoneSelectOption[] {
  const needle = searchKey(query, locale)
  if (!needle)
    return [...options]
  const terms = needle.split(' ')
  return options.filter(option => terms.every(term => option.searchText.includes(term)))
}
