/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use approval 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ApprovalApi, ApprovalSchema } from '@xihan-ui/headless'
import { approvalMachine, connectApproval } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = ApprovalSchema['props']

export interface ApprovalContext {
  service: Service<ApprovalSchema>
  api: ApprovalApi
}

export function useApproval(props: Props): ApprovalContext {
  const scope = useReactScope()
  const service = useMachine(approvalMachine, () => props, { scope })
  return { service, api: connectApproval(service, reactNormalize) }
}
