import type { TagApi, TagSchema } from '@xihan-ui/headless'
import { connectStaticTag, connectTag, tagMachine } from '@xihan-ui/headless'
import { useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TagContext {
  api: TagApi
}

// 不建 scope：connect 不派生任何 id
/** 跑机器的那一路：给了关闭钮，展开态由机器管。 */
export function useTag(props: TagSchema['props']): TagContext {
  const service = useMachine(tagMachine, () => props)
  return { api: connectTag(service, reactNormalize) }
}

/**
 * 不建机器的那一路：不给关闭钮的标签没有任何能改状态的事件，展开态恒等于
 * `open ?? defaultOpen ?? true`。
 *
 * 非受控时它住在这个格子里；受控时格子不参与，值每次从 prop 现读。
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
