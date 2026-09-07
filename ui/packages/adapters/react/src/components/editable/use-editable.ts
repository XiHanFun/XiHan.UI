import type { Service } from '@xihan-ui/core'
import type { EditableApi, EditableSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectEditable, editableMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface EditableContext {
  api: EditableApi
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<EditableSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  /** 输入框节点，进编辑态后焦点搬进它。 */
  inputRef: RefObject<HTMLElement | null>
  /** 预览区节点，退出编辑态后焦点还给它。 */
  previewRef: RefObject<HTMLElement | null>
}

export function useEditable(props: EditableSchema['props']): EditableContext {
  // 两态各自的 id 由 scope 派生，label 的 for 指向输入框
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLElement | null>(null)
  const previewRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传取值器而非节点，进出编辑态时现取
  const onCreate = useCallback((service: Service<EditableSchema>) => {
    service.refs.set('getInputEl', (() => inputRef.current) as never)
    service.refs.set('getPreviewEl', (() => previewRef.current) as never)
  }, [])

  const service = useMachine(editableMachine, () => props, { scope, onCreate })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectEditable(service, reactNormalize), service, rootRef, inputRef, previewRef }
}
