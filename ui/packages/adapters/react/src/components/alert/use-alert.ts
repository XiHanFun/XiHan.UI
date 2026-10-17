/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use alert 相关实现。

import type { Service } from '@xihan-ui/core'
import type { AlertApi, AlertSchema } from '@xihan-ui/headless'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { alertMachine, connectAlert } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'

export interface AlertContext {
  api: AlertApi
  service: Service<AlertSchema>
  /** 标题与说明在不在场，由 XhAlertTitle / XhAlertDescription 登记；只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

export function useAlert(props: AlertSchema['props']): AlertContext {
  const scope = useReactScope()
  const presence = useTitleDescriptionPresence()
  const service = useMachine(alertMachine, () => ({ ...props, parts: presence.parts }), { scope })
  return { api: connectAlert(service, reactNormalize), service, presence }
}
