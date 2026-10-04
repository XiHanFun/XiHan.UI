/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 语言包的形状：一份 locale 加一份按组件分桶的文案，可直接交给各适配器的全局配置。

import type { XhTranslationOverrides } from '../config/translations'

/** 一份内建语言包。可以整份交给全局配置，也可以与其他配置项合并后再交。 */
export interface XhLocale {
  /** BCP 47 语言标记，日期时间类组件据此排月份名、星期名、段位顺序与周首日。 */
  readonly locale: string
  /** 按组件收纳的文案，形状与全局配置的 translations 相同。 */
  readonly translations: XhTranslationOverrides
}

/**
 * 语言包刻意不收的键。它们没有内建英文缺省，或者缺省取自实例自己的内容：
 * 作者自写的标签与可见文字（`menu.content`、`tour.next`、各处 placeholder）、
 * 条目自己的名字（拖拽播报里的 `item`）、随 locale 由 Intl 给出的说法（`timestamp.justNow`）。
 * 语言包给了它们，改掉的就不只是语言，而是行为。
 */
interface LocaleExcludedKeys {
  'approval': 'approve' | 'deny' | 'notePlaceholder'
  'clipboard': 'copy'
  'download-trigger': 'trigger'
  'kbd': 'keyName'
  'mention': 'input'
  'menu': 'content'
  'prompt-input': 'input'
  'question-flow': 'notePlaceholder' | 'skip' | 'continue' | 'send'
  'rating': 'item'
  'sortable': 'item'
  'steps': 'list'
  'table': 'item'
  'tabs': 'item'
  'timestamp': 'justNow'
  'tool-call': 'ranFor'
  'tour': 'next' | 'finish'
  'tree': 'item'
}

type Bucket<K extends keyof XhTranslationOverrides> = Required<NonNullable<XhTranslationOverrides[K]>>
type Excluded<K> = K extends keyof LocaleExcludedKeys ? LocaleExcludedKeys[K] : never
type LocaleKeys<K extends keyof XhTranslationOverrides> = Exclude<keyof Bucket<K>, Excluded<K>>

/**
 * 一份完整语言包的文案：每个有内建英文缺省的键都得给，刻意不收的键给了即报错。
 * 组件新增文案键后，各语言包在类型检查里一并报缺，不会悄悄退回英文。
 */
export type XhLocaleTranslations = {
  readonly [K in keyof XhTranslationOverrides as [LocaleKeys<K>] extends [never] ? never : K]-?: Pick<Bucket<K>, LocaleKeys<K>>
}
