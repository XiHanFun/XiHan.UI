/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 迷你图的取模型与内建文案：机器与连接层读同一条管线。只算值，不写属性。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { SparklineModel } from './sparkline.model'
import type { SparklineSchema } from './sparkline.schema'
import type { SparklineSummary, SparklineTranslations } from './sparkline.types'
import { resolveLocale } from '@xihan-ui/core'

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

/** 缺省摘要：点数与范围一句，末值与首末变化一句；盈亏形态报正负各几个。 */
export function defaultSparklineSummary(model: SparklineSummary): string {
  if (model.count === 0)
    return 'No data.'
  if (model.variant === 'win-loss') {
    const parts = [plural(model.wins, 'win', 'wins'), plural(model.losses, 'loss', 'losses')]
    if (model.ties > 0)
      parts.push(plural(model.ties, 'tie', 'ties'))
    return `${plural(model.count, 'result', 'results')}: ${parts.join(', ')}.`
  }
  if (model.count === 1)
    return `1 point: ${model.last}.${model.reference == null ? '' : ` Reference ${model.reference}.`}`
  const range = model.min === model.max ? `all ${model.max}` : `ranging from ${model.min} to ${model.max}`
  const head = `${model.count} points, ${range}.${model.reference == null ? '' : ` Reference ${model.reference}.`}`
  if (model.direction === 'flat')
    return `${head} Last ${model.last}, unchanged from the first.`
  if (model.change == null)
    return `${head} Last ${model.last}.`
  return `${head} Last ${model.last}, ${model.direction} ${model.change} from the first.`
}

export const SPARKLINE_TRANSLATIONS: SparklineTranslations = Object.freeze({
  summary: defaultSparklineSummary,
})

const translationsCache = new WeakMap<object, SparklineTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，摘要段才不会因为文案对象每次新建而重算。 */
export function sparklineTranslations(overrides: Partial<SparklineTranslations> | undefined): SparklineTranslations {
  if (!overrides)
    return SPARKLINE_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    // 未给的条目取缺省；显式写 undefined 等于没给
    hit = { summary: overrides.summary ?? SPARKLINE_TRANSLATIONS.summary }
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface SparklineModelSource {
  prop: PropFn<SparklineSchema>
  context: { get: <K extends keyof SparklineSchema['context']>(key: K) => SparklineSchema['context'][K] }
  refs: { get: <K extends keyof SparklineSchema['refs']>(key: K) => SparklineSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，输入不变只是读缓存。 */
export function sparklineModelOf(source: SparklineModelSource): SparklineModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    data: prop('data'),
    x: prop('x'),
    y: prop('y'),
    band: prop('band'),
    reference: prop('reference'),
    variant: prop('variant'),
    curve: prop('curve'),
    markers: prop('markers'),
    format: prop('format'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    locale: resolveLocale(prop('locale'), scope),
    translations: sparklineTranslations(prop('translations')),
  })
}
