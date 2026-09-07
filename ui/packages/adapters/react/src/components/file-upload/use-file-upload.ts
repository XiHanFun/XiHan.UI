import type { Service } from '@xihan-ui/core'
import type { FileUploadApi, FileUploadSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectFileUpload, fileUploadMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FileUploadContext {
  api: FileUploadApi
  service: Service<FileUploadSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useFileUpload(props: FileUploadSchema['props']): FileUploadContext {
  // scope id 走 React 的 useId，保证同页多实例的 IDREF 与隐藏输入不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(fileUploadMachine, () => props, { scope })

  // 文件清单攥在机器里，原生 reset 只清掉那份 type=file 的影子输入（它本来就恒是空串）
  useFormReset(service, rootRef)

  return { api: connectFileUpload(service, reactNormalize), service, rootRef }
}
