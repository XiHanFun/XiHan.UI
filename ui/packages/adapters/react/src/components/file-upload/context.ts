import type { FileUploadItemProps } from '@xihan-ui/headless'
import type { FileUploadContext } from './use-file-upload'
import { createContext, useContext } from 'react'

const Ctx = createContext<FileUploadContext | undefined>(undefined)
/** 条目自报的文件，供 item-name / item-size-text / 删除按钮这些子部件复用同一份声明。 */
const ItemCtx = createContext<FileUploadItemProps | undefined>(undefined)

export const FileUploadProvider = Ctx
export const FileUploadItemProvider = ItemCtx

export function useFileUploadContext(): FileUploadContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFileUpload 的部件要放在 XhFileUploadRoot 里')
  return ctx
}

export function useFileUploadItemContext(): FileUploadItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhFileUploadItem 里')
  return item
}
