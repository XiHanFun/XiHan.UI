/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 file upload 相关实现。

import type { FileUploadApi, FileUploadFile, FileUploadRemoteFile, FileUploadSchema, FileUploadTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { fileUploadStructure } from '@xihan-ui/headless'
import { useEffect, useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { FileUploadItemProvider, FileUploadProvider, useFileUploadContext, useFileUploadItemContext } from './context'
import { useFileUpload } from './use-file-upload'

type FileUploadProps = FileUploadSchema['props']

/** 函数式 children 的载荷：文件清单与传输快照、投放区与数量状态，以及增删清空、开始上传、拉起选择器等命令。 */
export type FileUploadRootSlotProps = Pick<
  FileUploadApi,
  | 'acceptedFiles'
  | 'remoteFiles'
  | 'allFiles'
  | 'uploadOf'
  | 'startUpload'
  | 'cancelUpload'
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
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  /** 受控的本地文件清单；给定即受控。 */
  files?: File[]
  /** 非受控初值。 */
  defaultFiles?: File[]
  /** 受控的服务器已有附件。 */
  remoteFiles?: FileUploadRemoteFile[]
  defaultRemoteFiles?: FileUploadRemoteFile[]
  /** 传输实现；未提供时只接收文件不上传。 */
  upload?: FileUploadProps['upload']
  /** 选中即开始上传，默认开启。 */
  autoUpload?: boolean
  accept?: string | string[]
  maxFiles?: number
  maxFileSize?: number
  minFileSize?: number
  disabled?: boolean
  invalid?: boolean
  /** 只读：列表改不动，投放区与按钮仍可聚焦。 */
  readOnly?: boolean
  /** 必填：列表为空时文件输入带原生 required。 */
  required?: boolean
  /** 表单字段名；提供后影子输入才带 name。 */
  name?: string
  /** 是否接受拖放，默认接受。 */
  allowDrop?: boolean
  /** 是否接受粘贴，默认接受：焦点在组件里时 Ctrl / Cmd+V 收下剪贴板里的文件。 */
  allowPaste?: boolean
  /** 作者的准入判定：类型与大小通过后逐个调用，返回拒绝码即拒收并进 onFileReject。 */
  validate?: FileUploadProps['validate']
  /** 同时在传的文件数上限，默认不限；到了上限的排队。 */
  maxConcurrentUploads?: number
  /** 选择整个目录。 */
  directory?: boolean
  capture?: 'user' | 'environment'
  /** 附件链接的打开方式（target），缺省在当前页打开；写 _blank 时同时带 rel="noopener noreferrer"。 */
  linkTarget?: string
  translations?: Partial<FileUploadTranslations>
  onFilesChange?: FileUploadProps['onFilesChange']
  /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
  onClear?: () => void
  onFileAccept?: FileUploadProps['onFileAccept']
  onFileReject?: FileUploadProps['onFileReject']
  onRemoteFilesChange?: FileUploadProps['onRemoteFilesChange']
  onUploadComplete?: FileUploadProps['onUploadComplete']
  onUploadError?: FileUploadProps['onUploadError']
  onUploadCancel?: FileUploadProps['onUploadCancel']
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不给 children 时投放区里的内容；未写时取 translations.dropzone。 */
  dropzone?: ReactNode
  /** 不给 children 时列表之后带清空整份列表的按钮；给了 children 时放 clear-trigger 部件即可清空。 */
  clearable?: boolean
  children?: SlotChildren<FileUploadRootSlotProps>
}

export function XhFileUploadRoot({
  ariaLabel,
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
  readOnly,
  required,
  name,
  allowDrop,
  allowPaste,
  validate,
  maxConcurrentUploads,
  directory,
  capture,
  linkTarget,
  translations,
  onFilesChange,
  onClear,
  onFileAccept,
  onFileReject,
  onRemoteFilesChange,
  onUploadComplete,
  onUploadError,
  onUploadCancel,
  label,
  dropzone,
  clearable,
  children,
  ...rest
}: XhFileUploadRootProps): ReactNode {
  const ctx = useFileUpload(withXhConfig('file-upload', useFormControlProps({
    ariaLabel,
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
    readOnly,
    required,
    name,
    allowDrop,
    allowPaste,
    validate,
    maxConcurrentUploads,
    directory,
    capture,
    linkTarget,
    translations,
    onFilesChange,
    onClear,
    onFileAccept,
    onFileReject,
    onRemoteFilesChange,
    onUploadComplete,
    onUploadError,
    onUploadCancel,
  })) as FileUploadProps)
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
        {children == null
          ? renderDefaultStructure(api, { label, dropzone, clearable })
          : renderSlot(children, {
              acceptedFiles: api.acceptedFiles,
              remoteFiles: api.remoteFiles,
              allFiles: api.allFiles,
              uploadOf: api.uploadOf,
              startUpload: api.startUpload,
              cancelUpload: api.cancelUpload,
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

XhFileUploadRoot.xhEvents = ['clear', 'files-change', 'file-accept', 'file-reject', 'remote-files-change', 'upload-complete', 'upload-error', 'upload-cancel'] as const

export interface XhFileUploadLabelProps extends ComponentPropsWithRef<'label'> {}

/** 原生 label，getLabelProps 的 for 指向隐藏输入。 */
export function XhFileUploadLabel({ children, ...rest }: XhFileUploadLabelProps): ReactNode {
  const ctx = useFileUploadContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhFileUploadDropzoneProps extends ComponentPropsWithRef<'div'> {}

export function XhFileUploadDropzone({ children, ...rest }: XhFileUploadDropzoneProps): ReactNode {
  // 放进字段时字段的标签并进名字链、说明与错误文案进描述链；投放区是按钮，只取描述链，aria-invalid 由组件自己投影
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const ctx = useFileUploadContext()
  return (
    <div {...mergeReactProps(fieldLabel({ ...fieldWiring, ...ctx.api.getDropzoneProps() as Record<string, unknown> }), rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhFileUploadTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhFileUploadTrigger({ children, asChild, ...rest }: XhFileUploadTriggerProps): ReactNode {
  const ctx = useFileUploadContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'file-upload', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhFileUploadHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {}

/** 选择框入口：状态机打开它依靠该原生输入，对键盘与读屏不可见。 */
export function XhFileUploadHiddenInput({ ...rest }: XhFileUploadHiddenInputProps): ReactNode {
  // 隐藏输入也并进字段的标签：原生表单控件没有名字会被判为未标注
  const fieldLabel = useFieldLabelWiring()
  const ctx = useFileUploadContext()
  return <input {...mergeReactProps(fieldLabel(ctx.api.getHiddenInputProps() as Record<string, unknown>), rest as Record<string, unknown>)} />
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
  /** 该行显示哪个文件（本地或远程附件）。 */
  file?: FileUploadFile
  /** 改用下标从 allFiles（远程在前、本地在后）中取文件，兼收字符串。 */
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

/** 未提供内容时显示文件名。 */
export function XhFileUploadItemName({ children, ...rest }: XhFileUploadItemNameProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemNameProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? item.file.name}
    </span>
  )
}

export interface XhFileUploadItemLinkProps extends ComponentPropsWithRef<'a'> {}

/** 附件链接：指向文件的安全地址，未提供内容时显示文件名。 */
export function XhFileUploadItemLink({ children, ...rest }: XhFileUploadItemLinkProps): ReactNode {
  const ctx = useFileUploadContext()
  const item = useFileUploadItemContext()
  return (
    <a {...mergeReactProps(ctx.api.getItemLinkProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? item.file.name}
    </a>
  )
}

export interface XhFileUploadItemSizeTextProps extends ComponentPropsWithRef<'span'> {}

/** 未提供内容时显示格式化后的文件大小。 */
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

/** 该条的传输进度条，纯装饰；进度比例写在私有槽上供皮肤计算宽度。 */
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

/** 标准结构里各部件对应的组件。 */
const FILE_UPLOAD_PARTS = {
  'label': XhFileUploadLabel,
  'dropzone': XhFileUploadDropzone,
  'hidden-input': XhFileUploadHiddenInput,
  'list': XhFileUploadList,
  'item': XhFileUploadItem,
  'item-preview': XhFileUploadItemPreview,
  'item-name': XhFileUploadItemName,
  'item-link': XhFileUploadItemLink,
  'item-size-text': XhFileUploadItemSizeText,
  'item-progress': XhFileUploadItemProgress,
  'item-delete-trigger': XhFileUploadItemDeleteTrigger,
  'clear-trigger': XhFileUploadClearTrigger,
}

interface FileUploadStructureContent {
  label?: ReactNode
  dropzone?: ReactNode
  clearable?: boolean
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 fileUploadStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题与投放区内容原样放进对应部件。
 */
function renderDefaultStructure(api: FileUploadApi, content: FileUploadStructureContent): ReactNode[] {
  const { label, dropzone } = content
  const slotted: Readonly<Record<string, boolean>> = {
    label: label != null && typeof label !== 'string',
    dropzone: dropzone != null && typeof dropzone !== 'string',
  }
  const nodes = fileUploadStructure(api, {
    label: typeof label === 'string' ? label : undefined,
    dropzone: typeof dropzone === 'string' ? dropzone : undefined,
    clearable: content.clearable,
    slotted: name => slotted[name] === true,
  })
  return renderStructure(nodes, FILE_UPLOAD_PARTS, (node) => {
    switch (node.slot?.name) {
      case 'label':
        return label
      case 'dropzone':
        return dropzone
      default:
        return undefined
    }
  })
}
