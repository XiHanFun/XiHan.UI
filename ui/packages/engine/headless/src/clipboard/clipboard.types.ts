/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 clipboard 类型契约。

import type { ActionVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 复制状态。
 *
 * copying = 写入在途；写入是异步且可能失败的，不能点击后直接跳到 copied。
 */
export type ClipboardStatus = 'idle' | 'copying' | 'copied'

export interface ClipboardStatusChangeDetails {
  status: ClipboardStatus
}

export interface ClipboardCopyErrorDetails {
  /** 写入失败的原因：权限被拒或非安全上下文时是浏览器返回的拒绝值，接口缺席时是本组件合成的 Error。 */
  error: unknown
  /** 本次尝试写入剪贴板的文本。 */
  value: string
}

/** 指示器的调用方声明：作者写两个指示器，各自说明属于哪一侧。 */
export interface ClipboardIndicatorProps {
  /** true = 复制成功一侧的标记（对钩），false = 常态一侧（复制图标）。 */
  copied: boolean
}

export interface ClipboardSchema extends MachineSchema {
  props: {
    /** 要复制的文本；未提供时复制空串。 */
    value?: string
    /** 复制成功后指示器保持多久（毫秒），默认 3000；<=0 或非有限数表示不自动回落。 */
    timeout?: number
    /** 禁用：复制按钮不可点击，作者调用 api.copy() 也无效（守卫在状态机层）。 */
    disabled?: boolean
    /** 变体：solid / subtle / outline / ghost。 */
    variant?: ActionVariant
    /** 颜色：brand / neutral / success / warning / danger / info。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<ClipboardTranslations>
    /** 状态每次落定时通知一次；挂载时的 idle 是初始态，不通知。 */
    onStatusChange?: (details: ClipboardStatusChangeDetails) => void
    /** 写入失败时通知；此时状态已回到 idle。 */
    onCopyError?: (details: ClipboardCopyErrorDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: ClipboardStatus
  event:
    /** 用户点击了复制按钮，或作者调用 api.copy()。写入在途时（copying）不接受，避免同一次点击写入两遍。 */
    | { type: 'COPY.TRIGGER' }
    /** 写入 promise 兑现，由 copying 的副作用回送。 */
    | { type: 'COPY.SUCCESS' }
    /**
     * 写入 promise 拒绝，由 copying 的副作用回送，附带原始拒绝值。
     * value 是发起时固定的文本，不是兑现时的 prop：写入途中宿主修改了 value，
     * 报出的必须仍是实际写入的文本。
     */
    | { type: 'COPY.ERROR', error: unknown, value: string }
    /** 停留计时到期，指示器应收回。 */
    | { type: 'after.timeout' }
  tag: never
  guard: 'isDisabled'
  action: 'invokeCopying' | 'invokeCopied' | 'invokeIdle' | 'invokeCopyError'
  effect: 'writeValue' | 'trackTimeout'
}

export interface ClipboardApi<T extends PropTypes = PropTypes> {
  status: ClipboardStatus
  disabled: boolean
  /** 播报区未提供内容时朗读的语句；未达到已复制档时为空串。 */
  announcement: string
  /** 已复制成功且仍在停留窗口内。指示器与样式的唯一判据。 */
  copied: boolean
  /** 当前要复制的文本（prop 未提供时为空串）。 */
  value: string
  /** 发起一次复制意图，与点击按钮走同一路径。 */
  copy: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getCopyTriggerProps: () => T['button']
  getIndicatorProps: (props: ClipboardIndicatorProps) => T['element']
  /** 复制成功的播报区，视觉隐藏；未提供内容时朗读 announcement。 */
  getStatusProps: () => T['element']
}

/** 读屏文案，默认英文。 */
export interface ClipboardTranslations {
  /** 复制按钮的可及名。按钮内只有一个图标时，名字只能由这里提供。 */
  copy: string
  /** 复制成功后播报的语句。 */
  copied: string
}
