/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use tag 相关实现。

import type { TagApi, TagSchema } from '@xihan-ui/headless'
import { connectStaticTag, connectTag, tagMachine } from '@xihan-ui/headless'
import { useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TagContext {
  api: TagApi
}

/**
 * 运行状态机的路径：提供关闭按钮后，展开态由状态机管理。
 * 根节点带 scope 派生的 id：关闭时按它找到节点，等退场播完再藏起。
 */
export function useTag(props: TagSchema['props']): TagContext {
  const service = useMachine(tagMachine, () => props, { scope: useReactScope() })
  return { api: connectTag(service, reactNormalize) }
}

/**
 * 不建立状态机的路径：不提供关闭按钮的标签没有任何能改变状态的事件，展开态恒等于
 * `open ?? defaultOpen ?? true`。
 *
 * 非受控时它保存在该状态格中；受控时状态格不参与，值每次从 prop 现读。
 */
export function useStaticTag(props: TagSchema['props']): TagContext {
  const [local, setLocal] = useState(() => props.defaultOpen ?? true)
  const api = connectStaticTag(
    props,
    {
      get: () => props.open ?? local,
      set: setLocal,
    },
    reactNormalize,
  )
  return { api }
}
