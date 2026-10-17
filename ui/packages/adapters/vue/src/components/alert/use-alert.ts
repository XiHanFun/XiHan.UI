/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use alert 相关实现。

import type { AlertApi, AlertSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { createScope } from '@xihan-ui/core'
import { alertMachine, connectAlert } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface AlertContext {
  api: ComputedRef<AlertApi>
  /** 标题与说明在不在场，由 XhAlertTitle / XhAlertDescription 登记；只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

export function useAlert(
  props: AlertSchema['props'],
  onOpenChange?: AlertSchema['props']['onOpenChange'],
): AlertContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const presence = useTitleDescriptionPresence()
  const service = useMachine(alertMachine, () => ({ ...props, parts: presence.parts.value, onOpenChange }), scope)
  const api = computed(() => connectAlert(service, vueNormalize))
  return { api, presence }
}
