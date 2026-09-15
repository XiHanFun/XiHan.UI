/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/core'
import type { DialogServiceBadge, DialogServiceControllerSpec, DialogServiceControllerState } from '@xihan-ui/headless'
import type { App, MaybeRefOrGetter, VNodeChild } from 'vue'
import type { XhConfig } from '../config/config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { createDialogServiceController, dialogServiceBadgeTone } from '@xihan-ui/headless'
import { createApp, defineComponent, h, reactive, shallowRef, toRaw, toValue } from 'vue'
import { XhButton, XhButtonIndicator, XhButtonLabel } from '../components/button'
import { XhDialogBody, XhDialogContent, XhDialogDescription, XhDialogFooter, XhDialogHeader, XhDialogIndicator, XhDialogRoot, XhDialogTitle } from '../components/dialog/dialog'
import { spinArc } from './glyph'
import { createServiceConfig } from './service-config'

/**
 * 对话框正文。传字符串时经 description 部件（读屏的 aria-describedby 由它承接）；
 * 传渲染函数时整块展开在正文位，自行决定渲染内容。
 *
 * 不接收裸 VNode：服务的宿主是常驻的，忙态切换即整棵重渲，
 * 同一个 VNode 实例被复用时的行为未定义。
 */
export type DialogBody = string | (() => VNodeChild)

/** 动作异常保留原始原因；可见文案由 actionErrorText 提供。 */
export interface DialogActionError {
  cause: unknown
}

export interface ConfirmOptions {
  title: string
  content?: DialogBody
  /** 确认按钮语气，默认 brand；危险操作传 danger。 */
  tone?: Tone
  /** 标题旁的类型徽记。未提供时不显示徽记。 */
  badge?: DialogServiceBadge
  okText?: MaybeRefOrGetter<string>
  cancelText?: MaybeRefOrGetter<string>
  /** false 阻止关闭；抛错或 Promise 拒绝进入 actionError，保持打开。 */
  onOk?: () => boolean | void | Promise<unknown>
  /** 动作失败通知；通知自身失败时拒绝所属请求。 */
  onActionError?: (error: DialogActionError) => void | Promise<void>
}

/** 单按钮告知框的入参：没有取消按钮，徽记由预设档决定，其余同 confirm。 */
export type AlertOptions = Omit<ConfirmOptions, 'tone' | 'badge'>

/** 取值型弹窗的入参。正文自行拼装表单，确认时把该份值带回。 */
export interface PromptOptions<T extends object> extends Omit<ConfirmOptions, 'onOk' | 'content'> {
  /** 每次打开建立一份初值；服务用 reactive 包装后交给 body 与 onOk，两边是同一份。 */
  initialValue: T
  /** 用该份可写代理渲染表单主体。 */
  body: (value: T) => VNodeChild
  /** 落焦到哪个节点，CSS 选择器。 */
  initialFocus?: string
  /** false 只阻止关闭；抛错或拒绝进入独立动作异常，弹窗保持打开。 */
  onOk?: (value: T) => boolean | void | Promise<boolean | void>
}

export interface DialogServiceOptions {
  /** 确认按钮文案，默认 OK。 */
  okText?: MaybeRefOrGetter<string>
  /** 取消按钮文案，默认 Cancel。 */
  cancelText?: MaybeRefOrGetter<string>
  /** 动作失败时的安全提示，支持与按钮文案相同的响应式来源。 */
  actionErrorText?: MaybeRefOrGetter<string>
  /**
   * 提供给对话框子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主应用，无法接收组件树中的 provideXhConfig，需要与应用同语言时从这里提供；
   * 传 ref/getter 即可在运行期跟随切换语言，也可以之后用 setConfig 推送。
   */
  config?: MaybeRefOrGetter<XhConfig>
  /** 宿主容器；未提供时在 body 下新建一个。 */
  target?: HTMLElement
}

export interface DialogService {
  /** 当前请求的动作异常，重试、关闭和切换请求时清空。 */
  readonly actionError: DialogActionError | null
  /** 确认经 onOk 后 resolve true；取消/Esc resolve false。 */
  confirm: (options: ConfirmOptions) => Promise<boolean>
  info: (options: AlertOptions) => Promise<void>
  success: (options: AlertOptions) => Promise<void>
  warning: (options: AlertOptions) => Promise<void>
  error: (options: AlertOptions) => Promise<void>
  /** 确认后 resolve 一份值的普通对象快照；取消 / Esc / 卸载 resolve null。 */
  prompt: <T extends object>(options: PromptOptions<T>) => Promise<T | null>
  /** 更换全局配置源。 */
  setConfig: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

interface Spec extends DialogServiceControllerSpec {
  title: string
  content?: DialogBody
  tone: Tone
  okText: MaybeRefOrGetter<string>
  cancelText: MaybeRefOrGetter<string>
  showCancel: boolean
  /** 标题旁的类型徽记（预设档使用），confirm 不带。 */
  badge?: DialogServiceBadge
  /** 返回 false 阻止本次确认；异常由独立错误状态报告。 */
  onOk?: () => unknown
  onActionError?: (error: DialogActionError) => void | Promise<void>
  /** 取值型弹窗的正文与可写的值，两边是同一个对象。 */
  body?: (value: object) => VNodeChild
  value?: object
  initialFocus?: string
}

export function createDialogService(options: DialogServiceOptions = {}): DialogService {
  if (typeof document === 'undefined')
    throw new Error('createDialogService 需要 document；SSR 里请等到客户端再创建')

  // 文案不在创建时求值：队列里的对话框会跨过一次切语言
  const defaults = { okText: options.okText ?? 'OK', cancelText: options.cancelText ?? 'Cancel' }
  const configSource = createServiceConfig(options.config)
  const holder = options.target ?? document.createElement('div')
  let hostFailure: { cause: unknown } | null = null
  try {
    if (!options.target)
      ensurePortalRoot(document).appendChild(holder)
    if (holder.nodeType !== 1 || holder.ownerDocument !== document || !holder.isConnected)
      throw new Error('DialogService target 必须是当前文档中已连接的元素')
  }
  catch (cause) {
    hostFailure = { cause }
  }

  // 整份核心快照放 shallowRef：Spec 里的 MaybeRefOrGetter 不能被 reactive 深层解包。
  let publishState: (next: DialogServiceControllerState<Spec>) => void = () => {}
  const controller = createDialogServiceController<Spec>({
    onStateChange: next => publishState(next),
  })
  const state = shallowRef(controller.state)
  publishState = next => void (state.value = next)
  if (hostFailure)
    controller.fail(hostFailure.cause)

  // 机器侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  function onOpenChange(open: boolean): void {
    if (open)
      return
    controller.close(false)
  }

  const Host = defineComponent({
    name: 'XhDialogServiceHost',
    setup() {
      configSource.provide()
      return () => {
        const serviceState = state.value
        if (serviceState.failure)
          return null
        const request = serviceState.current
        const spec = request?.spec
        return h(XhDialogRoot, {
          'open': serviceState.open,
          'onUpdate:open': onOpenChange,
          'modal': true,
          'role': 'alertdialog',
          'closeOnEscape': !serviceState.busy,
          'closeOnInteractOutside': false,
          'initialFocus': spec?.initialFocus,
          'onExitComplete': () => controller.finishExit(request),
        }, () => spec
          ? h(XhDialogContent, null, () => [
              h(XhDialogHeader, null, () => [
                spec.badge ? h(XhDialogIndicator, { 'data-tone': dialogServiceBadgeTone(spec.badge) }) : null,
                h(XhDialogTitle, () => spec.title),
              ]),
              h(XhDialogBody, null, () => [
                // 串走 description，函数正文与 prompt 表单也在唯一滚动区内。
                typeof spec.content === 'string'
                  ? h(XhDialogDescription, () => spec.content as string)
                  : typeof spec.content === 'function' ? spec.content() : null,
                spec.body && spec.value ? spec.body(spec.value) : null,
                serviceState.actionError ? h('p', { role: 'alert', style: { color: 'var(--xh-fg-danger)' } }, toValue(options.actionErrorText) ?? 'Action failed. Please try again.') : null,
              ]),
              h(XhDialogFooter, null, () => [
                spec.showCancel
                  ? h(XhButton, { variant: 'ghost', disabled: serviceState.busy, onClick: () => controller.close(false) }, () => toValue(spec.cancelText))
                  : null,
                h(XhButton, { variant: 'solid', tone: spec.tone, loading: serviceState.busy, onClick: controller.confirmCurrent }, () => [
                  serviceState.busy ? h(XhButtonIndicator, () => spinArc()) : null,
                  h(XhButtonLabel, () => (serviceState.busy ? `${toValue(spec.okText)}…` : toValue(spec.okText))),
                ]),
              ]),
            ])
          : null)
      }
    },
  })

  const app: App = createApp(Host)
  let mounted = false
  function failHost(cause: unknown): void {
    controller.fail(cause)
  }
  app.config.errorHandler = failHost
  if (!hostFailure) {
    try {
      app.mount(holder)
      mounted = true
    }
    catch (cause) {
      failHost(cause)
    }
  }

  const alert = (badge: DialogServiceBadge, tone: Tone) => async (opts: AlertOptions): Promise<void> => {
    await controller.request({
      title: opts.title,
      content: opts.content,
      tone,
      okText: opts.okText ?? defaults.okText,
      cancelText: defaults.cancelText,
      showCancel: false,
      badge,
      onOk: opts.onOk,
      onActionError: opts.onActionError,
    })
  }

  return {
    get actionError() { return controller.state.actionError },
    confirm: opts => controller.request({
      title: opts.title,
      content: opts.content,
      tone: opts.tone ?? 'brand',
      okText: opts.okText ?? defaults.okText,
      cancelText: opts.cancelText ?? defaults.cancelText,
      showCancel: true,
      badge: opts.badge,
      onOk: opts.onOk,
      onActionError: opts.onActionError,
    }),
    prompt: <T extends object>(opts: PromptOptions<T>): Promise<T | null> => {
      // body 与 onOk 拿的是同一份可写代理：正文里改了什么，确认时就读到什么
      const value = reactive({ ...opts.initialValue }) as T
      return controller.request({
        title: opts.title,
        tone: opts.tone ?? 'brand',
        okText: opts.okText ?? defaults.okText,
        cancelText: opts.cancelText ?? defaults.cancelText,
        showCancel: true,
        badge: opts.badge,
        initialFocus: opts.initialFocus,
        body: v => opts.body(v as T),
        value,
        onOk: opts.onOk ? () => opts.onOk!(value) : undefined,
        onActionError: opts.onActionError,
      }).then(ok => (ok ? { ...toRaw(value) } as T : null))
    },
    info: alert('info', 'info'),
    success: alert('success', 'success'),
    warning: alert('warning', 'warning'),
    error: alert('error', 'danger'),
    setConfig: next => configSource.set(next),
    dispose: () => {
      controller.dispose()
      if (mounted)
        app.unmount()
      if (!options.target)
        holder.remove()
    },
  }
}
