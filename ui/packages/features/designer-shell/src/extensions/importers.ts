/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导入来源：把粘贴与拖放带来的数据列成交给导入器的来源，四款的粘贴、拖放共用。

import type { DesignerImportSource } from '@xihan-ui/designer-kit'

/** 导入时依次查看的文本类型：链接、HTML、纯文本。 */
const IMPORT_TEXT_TYPES = ['text/uri-list', 'text/html', 'text/plain'] as const

/**
 * 把剪贴板或拖放带来的数据列成导入来源：先是每个文件（带类型与文件名），再按链接、HTML、纯文本的顺序
 * 列出不为空的文本。交给 designer-kit 的 findImporter，前面的来源先问。
 */
export function importSources(data: Pick<DataTransfer, 'files' | 'getData'>, kind: 'clipboard' | 'drop'): DesignerImportSource[] {
  const files = Array.from(data.files, (file): DesignerImportSource => ({ kind, mime: file.type, name: file.name, file }))
  const texts = IMPORT_TEXT_TYPES.flatMap((mime): DesignerImportSource[] => {
    const text = data.getData(mime)
    return text === '' ? [] : [{ kind, mime, text }]
  })
  return [...files, ...texts]
}
