/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标题与说明两个可选部件的在场统计：部件自行登记，根把结果交给 connect。

import type { TitleDescriptionParts } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { hasNamingContent } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, onMounted, onUpdated, reactive, ref } from 'vue'

export type TitleDescriptionPart = keyof TitleDescriptionParts

export interface TitleDescriptionPresence {
  /** 已挂载的 title / description 各几个。 */
  counts: Record<TitleDescriptionPart, number>
  /** 交给 connect 的在场情况；根挂载前（含服务端直出）为 undefined，按都在场处理。 */
  parts: ComputedRef<TitleDescriptionParts | undefined>
}

/** 在根组件的 setup 里调用。 */
export function useTitleDescriptionPresence(): TitleDescriptionPresence {
  const counts = reactive<Record<TitleDescriptionPart, number>>({ title: 0, description: 0 })
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  const parts = computed<TitleDescriptionParts | undefined>(() => mounted.value
    ? { title: counts.title > 0, description: counts.description > 0 }
    : undefined)
  return { counts, parts }
}

/** 部件挂载期间登记在场，卸载时撤销；present 给出时每次渲染后现判。 */
export function useTitleDescriptionPart(presence: TitleDescriptionPresence, part: TitleDescriptionPart, present: () => boolean = () => true): void {
  let counted = false
  const sync = (): void => {
    const next = present()
    if (next === counted)
      return
    presence.counts[part] += next ? 1 : -1
    counted = next
  }
  onMounted(sync)
  onUpdated(sync)
  onBeforeUnmount(() => {
    if (counted)
      presence.counts[part]--
    counted = false
  })
}

/** 说明部件登记在场：读不出一句话的说明按不在场处理。返回要挂到说明节点上的 ref。 */
export function useDescriptionPart(presence: TitleDescriptionPresence): Ref<HTMLElement | null> {
  const el = ref<HTMLElement | null>(null)
  useTitleDescriptionPart(presence, 'description', () => el.value != null && hasNamingContent(el.value))
  return el
}
