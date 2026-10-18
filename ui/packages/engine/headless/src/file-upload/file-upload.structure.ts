/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文件上传的标准结构：标题、投放区、表单影子与按 allFiles 铺的文件列表。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { fileUploadAnatomy } from './file-upload.anatomy'
import type { FileUploadApi } from './file-upload.types'

type FileUploadPart = (typeof fileUploadAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const FILE_UPLOAD_STRUCTURE_PARTS = [
  'label',
  'dropzone',
  'hidden-input',
  'list',
  'item',
  'item-preview',
  'item-name',
  'item-link',
  'item-size-text',
  'item-progress',
  'item-delete-trigger',
  'clear-trigger',
] as const satisfies readonly FileUploadPart[]

/** anatomy 里不进标准结构的部件：投放区就是打开选择框的入口，单独的选择钮由作者手写结构时自己摆。 */
export const FILE_UPLOAD_STRUCTURE_OMITS = [
  'trigger',
] as const satisfies readonly FileUploadPart[]

type FileUploadStructurePart = (typeof FILE_UPLOAD_STRUCTURE_PARTS)[number]

type FileUploadStructureNode = StructureNode<FileUploadStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface FileUploadStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 投放区的说明文字：给了就写进 dropzone，没给时取 translations.dropzone；dropzone 插槽有内容时内容归作者。 */
  dropzone?: string
  /** 列表之后带不带清空整份列表的按钮，缺省不带。 */
  clearable?: boolean
  /** 作者给了哪些插槽的内容：label、dropzone。 */
  slotted?: StructureSlotted
}

type FileUploadStructureModel = Pick<FileUploadApi, 'allFiles' | 'fileKey' | 'fileHref' | 'translations'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 文件上传在 root 里的标准结构，次序是标题、投放区、表单影子、文件列表、清空钮（clearable 时才铺）。
 * 标题是原生 label；投放区是唯一可聚焦的打开入口，说明文字取 translations（先取 dropzone 选项）。
 * 列表里 allFiles 每个文件一行，按 fileKey 认行、按下标绑定文件；行里依次是缩略图、文件名、大小、进度与删除钮，
 * 文件名与大小由组件按文件填。远程附件有安全的地址（fileHref）时，文件名里铺一条写着文件名的链接。
 */
export function fileUploadStructure(model: FileUploadStructureModel, options: FileUploadStructureOptions = {}): FileUploadStructureNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: FileUploadStructureNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push(
    slotted('dropzone')
      ? { key: 'dropzone', tag: 'div', part: 'dropzone', slot: { name: 'dropzone' } }
      : { key: 'dropzone', tag: 'div', part: 'dropzone', text: options.dropzone ?? model.translations.dropzone },
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
    {
      key: 'list',
      tag: 'div',
      part: 'list',
      children: model.allFiles.map((file, index): FileUploadStructureNode => ({
        key: `item:${model.fileKey(file)}`,
        tag: 'div',
        part: 'item',
        attrs: { index: String(index) },
        children: [
          { key: 'preview', tag: 'div', part: 'item-preview' },
          model.fileHref(file) === undefined
            ? { key: 'name', tag: 'span', part: 'item-name' }
            : { key: 'name', tag: 'span', part: 'item-name', children: [{ key: 'link', tag: 'a', part: 'item-link', text: file.name }] },
          { key: 'size-text', tag: 'span', part: 'item-size-text' },
          { key: 'progress', tag: 'div', part: 'item-progress' },
          { key: 'delete-trigger', tag: 'button', part: 'item-delete-trigger' },
        ],
      })),
    },
  )
  if (options.clearable)
    nodes.push({ key: 'clear-trigger', tag: 'button', part: 'clear-trigger' })
  return nodes
}
