/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自动保存：把整份模板存成这台浏览器里的草稿（localStorage），宿主不参与。开着自动保存、又有未保存的修改时，
// 停手一会儿就存一份；设计器变干净时删掉草稿，关着自动保存时不删已有的。载入一份模板时，同一个草稿键下有和它
// 不一样的草稿就问恢复还是丢弃。读写失败安静跳过，不影响编辑。

import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerCommandsTranslations } from './translations'
import { isJsonValue, jsonEquals } from '@xihan-ui/core/json'
import { resolveXhConfig } from '@xihan-ui/web-components'

/** 草稿存在 localStorage 里的键前缀，后面接设计器种类与草稿键。 */
const DRAFT_PREFIX = 'xh-designer-draft'

/** 停手多久存一份草稿（毫秒）。 */
const DEFAULT_DELAY = 1000

/** 存下的一份草稿：存的时刻（毫秒时间戳）与整份模板。 */
interface DesignerDraft {
  readonly savedAt: number
  readonly document: JsonValue
}

/** createDesignerAutosave 的选项。 */
export interface DesignerAutosaveOptions {
  /** 设计器根：草稿存在它所在窗口的 localStorage 里，提示里的时间按它那棵子树的 locale 写。 */
  readonly root: HTMLElement
  /** 设计器种类，通常是元素的标签名，如 xh-flow-designer；不同种类的草稿互不相干。 */
  readonly kind: string
  /** 宿主给的草稿键（如模板 id），每次现取；没给时按页面地址区分。 */
  readonly key: () => string | undefined
  /** 此刻开着自动保存（通常是 autoSaveOf(生效的设置)）。 */
  readonly enabled: () => boolean
  /** 此刻的整份模板。 */
  readonly snapshot: () => JsonValue
  /** 恢复草稿：交给各款的整份替换（如 replaceDocument），进撤销栈。 */
  readonly restore: (document: JsonValue) => void
  /** 问恢复还是丢弃：okText 是恢复、cancelText 是丢弃，返回 true 即恢复。各款接自己的确认框（如 UI 的 createDialogService().confirm）。 */
  readonly confirm: (options: { readonly title: string, readonly content: string, readonly okText: string, readonly cancelText: string }) => Promise<boolean>
  /** 提示的文案：xh-designer-commands 那一桶。 */
  readonly translations: () => Pick<DesignerCommandsTranslations, 'draftFound' | 'draftFoundDescription' | 'draftRestore' | 'draftDiscard'>
  /** 停手多久存一份，缺省 1000 毫秒。 */
  readonly delay?: number
}

/** 一台设计器的自动保存。 */
export interface DesignerAutosave {
  /** 模板或保存状态变了时调：有未保存的修改且开着自动保存，停手一会儿存一份；变干净了删掉草稿；关着时不存也不删。 */
  readonly changed: (dirty: boolean) => void
  /**
   * 载入了一份模板时调：同一个草稿键下有和它不一样的草稿就问恢复还是丢弃，恢复交给 restore、丢弃即删；一样就悄悄删掉。
   * 问着的时候再调不会再问一次。
   */
  readonly loaded: (document: JsonValue) => Promise<void>
  /** 取消待存的一份，不删草稿。 */
  readonly dispose: () => void
}

/** 建一台设计器的自动保存。 */
export function createDesignerAutosave(options: DesignerAutosaveOptions): DesignerAutosave {
  const delay = options.delay ?? DEFAULT_DELAY
  let timer: ReturnType<typeof setTimeout> | undefined
  let asking: Promise<void> | undefined

  const win = (): Window | undefined => options.root.ownerDocument.defaultView ?? undefined

  const storageKey = (): string => {
    const own = options.key()
    const place = win()?.location
    return `${DRAFT_PREFIX}:${options.kind}:${own ?? (place ? `${place.pathname}${place.search}${place.hash}` : '')}`
  }

  const storage = (): Storage | undefined => {
    try {
      return win()?.localStorage
    }
    catch {
      return undefined
    }
  }

  const read = (): DesignerDraft | undefined => {
    try {
      const raw = storage()?.getItem(storageKey())
      if (raw === null || raw === undefined)
        return undefined
      const value: unknown = JSON.parse(raw)
      if (typeof value !== 'object' || value === null || typeof (value as DesignerDraft).savedAt !== 'number' || !isJsonValue((value as DesignerDraft).document))
        return undefined
      return value as DesignerDraft
    }
    catch {
      return undefined
    }
  }

  const write = (): void => {
    timer = undefined
    try {
      storage()?.setItem(storageKey(), JSON.stringify({ savedAt: Date.now(), document: options.snapshot() }))
    }
    catch {}
  }

  const remove = (): void => {
    try {
      storage()?.removeItem(storageKey())
    }
    catch {}
  }

  const cancel = (): void => {
    if (timer !== undefined)
      clearTimeout(timer)
    timer = undefined
  }

  /** 草稿存下的时间，按设计器根那棵子树的 locale 写成日期与时刻。 */
  const timeOf = (savedAt: number): string =>
    new Intl.DateTimeFormat(resolveXhConfig(options.root).locale, { dateStyle: 'medium', timeStyle: 'short' }).format(savedAt)

  return {
    changed(dirty) {
      cancel()
      if (!dirty) {
        remove()
        return
      }
      if (options.enabled())
        timer = setTimeout(write, delay)
    },
    loaded(document) {
      if (asking)
        return asking
      const draft = read()
      if (!draft)
        return Promise.resolve()
      if (jsonEquals(draft.document, document)) {
        remove()
        return Promise.resolve()
      }
      const t = options.translations()
      asking = options.confirm({ title: t.draftFound(timeOf(draft.savedAt)), content: t.draftFoundDescription, okText: t.draftRestore, cancelText: t.draftDiscard })
        .then((restore) => {
          if (restore)
            options.restore(draft.document)
          else
            remove()
        })
        .finally(() => {
          asking = undefined
        })
      return asking
    },
    dispose() {
      cancel()
    },
  }
}
