/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 页面级的礼貌播报：整页一个 role=status、aria-live=polite 的视觉隐藏播报区，第一次播报时挂到 body 末尾。
// 每次先清空、隔一拍再写，同一句话连播两次也会再读；写下后过一阵清空。
// 播报区被摘出文档时，下次播报重新挂回去。按 Document 存在 Document 上，页面上几份 core 共用同一个。
// 组件自己的状态变化（复制结果、轮播换页之类）由组件自带的播报区负责，不经这里。

import { createPageSharedRegistry } from '../../structure/page-shared-registry'
import { VISUALLY_HIDDEN_STYLE } from './visually-hidden'

/** 播报区的标记属性。 */
const ANNOUNCER_ATTR = 'data-xh-announcer'
/** 清空到写入的间隔。 */
const REWRITE_DELAY = 50
/** 写入到清空的间隔。 */
const CLEAR_DELAY = 7000

interface AnnouncerState {
  region: HTMLElement | null
  writeTimer: ReturnType<typeof setTimeout> | undefined
  clearTimer: ReturnType<typeof setTimeout> | undefined
}

const registry = createPageSharedRegistry<AnnouncerState>('announcer@1', () => ({
  region: null,
  writeTimer: undefined,
  clearTimer: undefined,
}))

/** announce 的选项。 */
export interface AnnounceOptions {
  /** 播报所在的文档；缺省取全局 document。 */
  document?: Document
}

function regionOf(doc: Document, state: AnnouncerState): HTMLElement {
  let region = state.region
  if (!region) {
    region = doc.createElement('div')
    region.setAttribute(ANNOUNCER_ATTR, '')
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    Object.assign(region.style, VISUALLY_HIDDEN_STYLE)
    state.region = region
  }
  if (!region.isConnected)
    doc.body.append(region)
  return region
}

function stopTimers(state: AnnouncerState): void {
  clearTimeout(state.writeTimer)
  clearTimeout(state.clearTimer)
  state.writeTimer = undefined
  state.clearTimer = undefined
}

/**
 * 以礼貌级播报一句话。先清空播报区，隔一拍写入 message，写下后过一阵清空；
 * 一拍之内再次调用时只留最后一句；message 为空字符串时只清空。没有 document 或 body 时不做事。
 */
export function announce(message: string, options: AnnounceOptions = {}): void {
  const doc = options.document ?? (typeof document === 'undefined' ? undefined : document)
  if (!doc?.body)
    return
  const state = registry.get(doc)
  const region = regionOf(doc, state)
  stopTimers(state)
  region.textContent = ''
  if (!message)
    return
  state.writeTimer = setTimeout(() => {
    state.writeTimer = undefined
    region.textContent = message
    state.clearTimer = setTimeout(() => {
      state.clearTimer = undefined
      region.textContent = ''
    }, CLEAR_DELAY)
  }, REWRITE_DELAY)
}

/** 停掉待写与待清空的计时，摘掉并丢弃这个文档的播报区。 */
export function resetAnnouncer(doc: Document = document): void {
  const state = registry.get(doc)
  stopTimers(state)
  state.region?.remove()
  state.region = null
}
