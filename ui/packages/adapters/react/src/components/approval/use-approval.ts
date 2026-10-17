/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use approval 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ApprovalApi, ApprovalSchema } from '@xihan-ui/headless'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { approvalMachine, connectApproval } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'

type Props = ApprovalSchema['props']

export interface ApprovalContext {
  service: Service<ApprovalSchema>
  api: ApprovalApi
  /** 标题与说明在不在场，由 XhApprovalTitle / XhApprovalDescription 登记；只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

export function useApproval(props: Props): ApprovalContext {
  const scope = useReactScope()
  const presence = useTitleDescriptionPresence()
  const service = useMachine(approvalMachine, () => ({ ...props, parts: presence.parts }), { scope })
  return { service, api: connectApproval(service, reactNormalize), presence }
}
