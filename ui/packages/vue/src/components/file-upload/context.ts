import type { FileUploadItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { FileUploadContext } from './use-file-upload'
import { inject, provide } from 'vue'

/** 条目自报的文件，供 item-name / item-size-text / 删除按钮这些子部件复用同一份声明。 */
export interface FileUploadItemContext {
  item: ComputedRef<FileUploadItemProps>
}

const KEY: InjectionKey<FileUploadContext> = Symbol('xh-file-upload')
const ITEM_KEY: InjectionKey<FileUploadItemContext> = Symbol('xh-file-upload-item')

export function provideFileUpload(ctx: FileUploadContext): void {
  provide(KEY, ctx)
}

export function useFileUploadContext(): FileUploadContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FileUpload 部件必须用在 XhFileUploadRoot 内')
  return ctx
}

export function provideFileUploadItem(ctx: FileUploadItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useFileUploadItemContext(): FileUploadItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] FileUpload 条目子部件必须用在 XhFileUploadItem 内')
  return ctx
}
