/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局命令式通知服务：自带一个挂到 body 的宿主树与默认卡片模板，
// info/success 等命令在任意模块作用域可调（推送回调、请求拦截器），
// 不要求调用点在组件树内。
import type {
  NotificationApi,
  NotificationDedupe,
  NotificationOptions,
  NotificationPlacement,
  NotificationTranslations,
  ResolvedNotification,
} from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { XhConfigSource } from './service-config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { connectNotification, createFeedbackServiceController, notificationMachine, resolveFeedbackServiceTitle } from '@xihan-ui/headless'
import { Fragment, useSyncExternalStore } from 'react'
import {
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from '../components/notification/notification'
import { XhConfigProvider } from '../config/config'
import { reactNormalize } from '../runtime/normalize-props'
import { createOwnedMachine, useOwnedMachine } from '../runtime/owned-machine'
import { mountServiceHost } from './mount-host'
import { createServiceConfig } from './service-config'

/** 文案可以传常量，也可以传取值函数：堆叠中的卡片会跨过一次语言切换。 */
export type NotificationTranslationsSource
  = | Partial<NotificationTranslations>
    | (() => Partial<NotificationTranslations>)

export interface NotificationServiceOptions {
  /** 默认落位，默认 bottom-end；单条可用 options.placement 覆盖。 */
  placement?: NotificationPlacement
  /** 每个位置最多同时保留几条，超出时先移除低优先级的、同级中移除最旧的。默认 5；传 Infinity 即不限。 */
  max?: number
  /** 重复的判定方式，默认 'id'；传 'content' 则同一内容合并为一条并计数。 */
  dedupe?: NotificationDedupe
  /** 同一堆叠内的间距（px），默认 16。 */
  gap?: number
  duration?: number
  pauseOnPageIdle?: boolean
  /** 通知的文案：堆叠区的读屏名与卡片上关闭按钮的读屏名，统一在一个桶中。 */
  translations?: NotificationTranslationsSource
  /**
   * 提供给通知子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主树，无法接收组件树中的 XhConfigProvider，需要与应用同语言时从这里提供；
   * 传取值函数即可在运行期跟随切换语言，也可以之后用 setConfig 推送。
   */
  config?: XhConfigSource
  /** 宿主容器；未提供时在 body 下新建一个。 */
  target?: HTMLElement
}

export interface NotificationCreateOptions extends NotificationOptions {
  onAction?: () => void
}

/** 语气糖的入参：只差 tone / loading 与 title，其余同 create。 */
export type NotificationMessageOptions = Omit<NotificationCreateOptions, 'tone' | 'loading' | 'title'>

export interface NotificationService {
  /** 入队并返回 id；同 id 已存在则就地改写，被合并的返回被并入的那一条。 */
  create: (options?: NotificationCreateOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (title: string, options?: NotificationMessageOptions) => string
  success: (title: string, options?: NotificationMessageOptions) => string
  warning: (title: string, options?: NotificationMessageOptions) => string
  danger: (title: string, options?: NotificationMessageOptions) => string
  /** 暂停当前这些卡片的计时，'service' 这一路与指针、焦点并存。 */
  pauseAll: () => void
  resumeAll: () => void
  /** 更换全局配置源。 */
  setConfig: (next: XhConfigSource) => void
  /** 卸载宿主树并移除容器。 */
  dispose: () => void
}

function DefaultCard(props: {
  item: ResolvedNotification
  translations: Partial<NotificationTranslations> | undefined
  paused: boolean
  onUnmounted: (id: string) => void
  onAction: (id: string) => void
}): ReactNode {
  const { item } = props
  return (
    <XhNotificationItem
      id={item.id}
      title={resolveFeedbackServiceTitle(item)}
      description={item.description}
      tone={item.tone}
      loading={item.loading}
      duration={item.duration}
      closable={item.closable}
      pauseOnPageIdle={item.pauseOnPageIdle}
      paused={props.paused}
      translations={props.translations}
      onStatusChange={({ id, status }: { id: string, status: string }) => {
        if (status === 'unmounted')
          props.onUnmounted(id)
      }}
      onAction={() => props.onAction(item.id)}
    >
      {/* 四个节点平铺：两列网格与右上角那颗叉都归皮肤，模板套一层行容器只会与它打架。
          指示符与说明都恒渲染——皮肤的 :empty 规则负责把空盒收走，
          而 aria-describedby 无条件指着说明那一个，节点缺席就成了悬空引用 */}
      <XhNotificationItemIndicator />
      <XhNotificationItemTitle />
      <XhNotificationItemDescription />
      {item.actionLabel ? <XhNotificationItemActionTrigger>{item.actionLabel}</XhNotificationItemActionTrigger> : null}
      {item.closable !== false ? <XhNotificationItemCloseTrigger /> : null}
    </XhNotificationItem>
  )
}

export function createNotificationService(options: NotificationServiceOptions = {}): NotificationService {
  if (typeof document === 'undefined')
    throw new Error('createNotificationService 需要 document；SSR 里请等到客户端再创建')

  const { target, config, ...queueProps } = options
  const configSource = createServiceConfig(config)
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).append(holder)

  // 宿主树在组件树之外，暂停一类的状态只能自己存一份并推给它重渲
  let version = 0
  const subs = new Set<() => void>()
  const notify = (): void => {
    version += 1
    for (const fn of [...subs]) fn()
  }
  const subscribe = (fn: () => void): (() => void) => {
    subs.add(fn)
    return () => void subs.delete(fn)
  }
  const controller = createFeedbackServiceController<NotificationOptions, Partial<NotificationOptions>>({
    name: 'notification',
    onStateChange: notify,
  })

  const readTranslations = (): Partial<NotificationTranslations> | undefined =>
    typeof queueProps.translations === 'function' ? queueProps.translations() : queueProps.translations

  // 队列机器归服务持有、建好即 start，端口随即接上：宿主树何时提交不再影响命令能否入队。
  // 从业务组件的 effect 里懒建本服务时 flushSync 只能排队，宿主要等那轮 effect 跑完才渲，
  // 机器与端口若跟着宿主的渲染体走，createNotificationService() 之后紧接着那条命令就被当成宿主没挂而丢掉。
  // props 每次现展开：文案是取值函数时才跟得上运行期切语言
  const queue = createOwnedMachine(
    notificationMachine,
    () => ({ ...queueProps, translations: readTranslations() }),
    configSource.read,
  )
  const queueApi = (): NotificationApi => connectNotification(queue.service, reactNormalize)
  controller.attach({
    create: opts => queueApi().create(opts),
    update: (id, opts) => queueApi().update(id, opts),
    dismiss: id => queueApi().dismiss(id),
    dismissAll: () => queueApi().dismissAll(),
  })

  function Host(): ReactNode {
    useSyncExternalStore(subscribe, () => version, () => version)
    // 部件不经上下文取队列：本服务自己收 status-change 把走完退场的那条删掉，
    // 卡片与队列之间因此没有第二条隐式链路
    const api = connectNotification(useOwnedMachine(queue), reactNormalize)
    controller.syncItems(api.visibleNotifications.map(item => item.id))
    return (
      <XhConfigProvider config={configSource.read()}>
        <div {...api.getRootProps() as Record<string, unknown>}>
          {api.placements.map(placement => (
            <div key={placement} {...api.getGroupProps({ placement }) as Record<string, unknown>}>
              {/* 按队列身份 id 给 key，避免节点被就地复用 */}
              {api.getItemsByPlacement(placement).map(item => (
                <Fragment key={item.id}>
                  <DefaultCard
                    item={item}
                    translations={readTranslations()}
                    paused={controller.state.paused}
                    onUnmounted={controller.unmounted}
                    onAction={controller.invokeAction}
                  />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </XhConfigProvider>
    )
  }

  const root: Root | null = mountServiceHost(holder, <Host />, 'notification')
  if (!root) {
    controller.attach(null)
    queue.dispose()
  }
  const stopConfig = configSource.subscribe(notify)

  /** 入队一条；回调另存一张表，队列记录中只保留文案。 */
  const create = (opts: NotificationCreateOptions = {}): string => {
    const { onAction, ...record } = opts
    return controller.create(record, onAction)
  }

  const sugar = (tone: NotificationOptions['tone']) =>
    (title: string, opts: NotificationMessageOptions = {}): string =>
      create({ ...opts, tone, title })

  return {
    create,
    update: controller.update,
    dismiss: controller.dismiss,
    dismissAll: controller.dismissAll,
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    danger: sugar('danger'),
    pauseAll: controller.pauseAll,
    resumeAll: controller.resumeAll,
    setConfig: next => configSource.set(next),
    dispose: () => {
      stopConfig()
      root?.unmount()
      controller.dispose()
      queue.dispose()
      if (!target)
        holder.remove()
    },
  }
}
