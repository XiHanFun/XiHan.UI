import type { FileUploadApi, FileUploadFile, FileUploadRemoteFile, FileUploadSchema, FileUploadTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { FileUploadItemProvider, FileUploadProvider, useFileUploadContext, useFileUploadItemContext } from './context'
import { useFileUpload } from './use-file-upload'

type FileUploadProps = FileUploadSchema['props']

/** 函数式 children 的载荷：文件清单与传输快照、投放区与数量状态，与增删清空、开传、拉起选择器等命令。 */
export type FileUploadRootSlotProps = Pick<
  FileUploadApi,
  | 'acceptedFiles'
  | 'remoteFiles'
  | 'allFiles'
  | 'uploadOf'
  | 'startUpload'
  | 'dragging'
  | 'empty'
  | 'disabled'
  | 'maxFiles'
  | 'getFileSizeText'
  | 'setFiles'
  | 'addFiles'
  | 'deleteFile'
  | 'clear'
  | 'openFilePicker'
>

export interface XhFileUploadRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange'> {
  /** 受控的本地文件清单；给定即受控。 */
  files?: File[]
  /** 非受控初值。 */
  defaultFiles?: File[]
  /** 受控的服务器已有附件。 */
  remoteFiles?: FileUploadRemoteFile[]
  defaultRemoteFiles?: FileUploadRemoteFile[]
  /** 传输实现；不给就只收文件不上传。 */
  upload?: FileUploadProps['upload']
  /** 选中即开传，默认开。 */
  autoUpload?: boolean
  accept?: string | string[]
  maxFiles?: number
  maxFileSize?: number
  minFileSize?: number
  disabled?: boolean
  invalid?: boolean
  /** 表单字段名；给了影子输入才带 name。 */
  name?: string
  /** 收不收拖放，默认收。 */
  allowDrop?: boolean
  /** 选整个目录。 */
  directory?: boolean
  capture?: 'user' | 'environment'
  translations?: Partial<FileUploadTranslations>
  onFilesChange?: FileUploadProps['onFilesChange']
  onFileAccept?: FileUploadProps['onFileAccept']
  onFileReject?: FileUploadProps['onFileReject']
  onRemoteFilesChange?: FileUploadProps['onRemoteFilesChange']
  onUploadComplete?: FileUploadProps['onUploadComplete']
  onUploadError?: FileUploadProps['onUploadError']
  children?: SlotChildren<FileUploadRootSlotProps>
}

export function XhFileUploadRoot({
  files,
  defaultFiles,
  remoteFiles,
  defaultRemoteFiles,
  upload,
  autoUpload,
  accept,
  maxFiles,
  maxFileSize,
  minFileSize,
  disabled,
  invalid,
  name,
  allowDrop,
  directory,
  capture,
  translations,
  onFilesChange,
  onFileAccept,
  onFileReject,
  onRemoteFilesChange,
  onUploadComplete,
  onUploadError,
  children,
  ...rest
}: XhFileUploadRootProps): ReactNode {
  const ctx = useFileUpload(withXhConfig('file-upload', {
    files,
    defaultFiles,
    remoteFiles,
    defaultRemoteFiles,
    upload,
    autoUpload,
    accept,
    maxFiles,
    maxFileSize,
    minFileSize,
    disabled,
    invalid,
    name,
    allowDrop,
    directory,
    capture,
    translations,
    onFilesChange,
    onFileAccept,
    onFileReject,
    onRemoteFilesChange,
    onUploadComplete,
    onUploadError,
  }) as FileUploadProps)
  const api = ctx.api

  return (
    <FileUploadProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          acceptedFiles: api.acceptedFiles,
          remoteFiles: api.remoteFiles,
          allFiles: api.allFiles,
          uploadOf: api.uploadOf,
          startUpload: api.startUpload,
          dragging: api.dragging,
          empty: api.empty,
          disabled: api.disabled,
          maxFiles: api.maxFiles,
          getFileSizeText: api.getFileSizeText,
          setFiles: api.setFiles,
          addFiles: api.addFiles,
          deleteFile: api.deleteFile,
          clear: api.clear,
          openFilePicker: api.openFilePicker,
        })}
      </div>
    </FileUploadProvider>
  )
}

XhFileUploadRoot.xhEvents = [
  'files-change',
  'file-accept',
  'file-reject',
  'remote-files-change',
  'upload-complete',
  'upload-error',
] as const

export interface XhFileUploadLabelProps extends ComponentPropsWithRef<'label'> {}

/** 原生 label，getLabelProps 的 for 指向隐藏输入。 */
export function XhFileUploadLabel({ children, ...rest }: XhFileUploadLabelProps): ReactNode {
  const ctx = useFileUploadContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhFileUploadDropzoneProps extends ComponentPropsWithRef<'div'> {}

export function XhFileUploadDropzone({ children, ...rest }: XhFileUploadDropzoneProps): ReactNode {
  const ctx = useFileUploadContext()
  return (
    <div {...mergeReactProps(ctx.api.getDropzoneProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhFileUploadTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhFileUploadTrigger({ children, asChild, ...rest }: XhFileUploadTriggerProps): ReactNode {
  const ctx = useFileUploadContext()
  const props = mergeReactProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'file-upload', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhFileUploadHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {}

/** 选择框入口：机器打开它靠这份原生输入，对键盘与读屏不可见。 */
export function XhFileUploadHiddenInput({ ...rest }: XhFileUploadHiddenInputProps): ReactNode {
  const ctx = useFileUploadContext()
  return <input {...mergeReactProps(ctx.api.getHiddenInputProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhFileUploadListProps extends ComponentPropsWithRef<'div'> {}

export function XhFileUploadList({ children, ...rest }: XhFileUploadListProps): ReactNode {
  const ctx = useFileUploadContext()
  return (
    <div {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhFileUploadItemProps extends ComponentPropsWithRef<'div'> {
  /** 这一行显示哪个文件（本地或远程附件）。 */
  file?: FileUploadFile
  /** 改用下标从 allFiles（远程在前、本地在后）里取文件，兼收字符串。 */
  index?: number | string
}

export function XhFileUploadItem({ file, index, children, ...rest }: XhFileUploadItemProps): ReactNode {
  const ctx = useFileUploadContext()
  const allFiles = ctx.api.allFiles
  const resolved = useMemo<FileUploadFile | undefined>(() => {
    if (file)
      return file
    if (index == null)
      return undefined
    return allFiles[Math.trunc(Number(index))]
  }, [file, index, allFiles])
  const item = useMemo(() => ({ file: resolved as FileUploadFile }), [resolved])

  // 下标指向的文件不存在时只渲染空壳，不打组件属性也不渲染子部件
  if (!resolved)
    return <div />

  return (
    <FileUploadItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </FileUploadItemProvider>
  )
}

export interface XhFileUploadItemNameProps extends ComponentPropsWithRef<'span'> {}

/** 没给内容就显示文件名。 */
export function XhFileUploadItemName({ children, ...rest }: XhFileUploadItemNameProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemNameProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? item.file.name}
    </span>
  )
}

export interface XhFileUploadItemSizeTextProps extends ComponentPropsWithRef<'span'> {}

/** 没给内容就显示格式化后的文件大小。 */
export function XhFileUploadItemSizeText({ children, ...rest }: XhFileUploadItemSizeTextProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemSizeTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.getFileSizeText(item.file)}
    </span>
  )
}

export interface XhFileUploadItemPreviewProps extends ComponentPropsWithRef<'div'> {}

export function XhFileUploadItemPreview({ children, ...rest }: XhFileUploadItemPreviewProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <div {...mergeReactProps(ctx.api.getItemPreviewProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhFileUploadItemProgressProps extends ComponentPropsWithRef<'div'> {}

/** 这一条的传输进度条，纯装饰；进度比例写在私有槽上供皮肤算宽度。 */
export function XhFileUploadItemProgress({ children, ...rest }: XhFileUploadItemProgressProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <div {...mergeReactProps(ctx.api.getItemProgressProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhFileUploadItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhFileUploadItemDeleteTrigger({ children, ...rest }: XhFileUploadItemDeleteTriggerProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFileUploadClearTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhFileUploadClearTrigger({ children, ...rest }: XhFileUploadClearTriggerProps): ReactNode {
  const ctx = useFileUploadContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
