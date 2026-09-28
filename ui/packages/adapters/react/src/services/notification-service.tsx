/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局命令式通知服务：自带一个挂到 body 的宿主树与默认卡片模板，
// info/success 等命令在任意模块作用域可调（推送回调、请求拦截器），
// 不要求调用点在组件树内。卡片与轻提示是同一个服务的两种预设，preset 在创建时定下。
import type {
  NotificationApi,
  NotificationDedupe,
  NotificationOptions,
  NotificationPlacement,
  NotificationPreset,
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
  XhNotificationItemContent,
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
  /** 形态预设，默认 card；轻提示传 'toast'。决定下面几项没写时的缺省值与卡片排版。 */
  preset?: NotificationPreset
  /** 默认落位：card 为 bottom-end，toast 为 bottom；单条可用 options.placement 覆盖。 */
  placement?: NotificationPlacement
  /** 每个位置最多同时保留几条，超出时先移除低优先级的、同级中移除最旧的：card 为 5、toast 为 3；传 Infinity 即不限。 */
  max?: number
  /** 重复的判定方式，默认 'id'；传 'content' 则同一内容合并为一条并计数。 */
  dedupe?: NotificationDedupe
  /** 同一堆叠内的间距（px）：card 为 16、toast 为 12。 */
  gap?: number
  /** 单条未写 duration 时的停留毫秒：card 为 5000、toast 为 4000。 */
  duration?: number
  /** 同一位置的几条叠成一摞：card 默认不叠，toast 默认叠。 */
  stacked?: boolean
  /** 页面切到后台时暂停计时：card 默认关闭，toast 默认开启。 */
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

/**
 * create 的入参。`actionLabel` 是卡片上行内动作按钮的文案，`onAction` 是按下它执行的动作：
 * 回调不进入队列记录（该记录要能被整份替换、序列化、比对），服务按 id 单独保存一张表。
 */
export interface NotificationCreateOptions extends NotificationOptions {
  onAction?: () => void
}

/** 语气糖的入参：只差 tone / loading 与 title，其余同 create。 */
export type NotificationMessageOptions = Omit<NotificationCreateOptions, 'tone' | 'loading' | 'title'>

/** promise 三态的标题：成功与失败可以传函数，拿到结果后再拼装标题。 */
export interface NotificationPromiseOptions<T> extends Omit<NotificationMessageOptions, 'duration'> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((reason: unknown) => string)
}

export interface NotificationService {
  /** 入队并返回 id；同 id 已存在则就地改写，被合并的返回被并入的那一条。 */
  create: (options?: NotificationCreateOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  /** 立即从队列中删除，不播退场动画。卡片自己的关闭按钮先播退场动画再移出。 */
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (title: string, options?: NotificationMessageOptions) => string
  success: (title: string, options?: NotificationMessageOptions) => string
  warning: (title: string, options?: NotificationMessageOptions) => string
  danger: (title: string, options?: NotificationMessageOptions) => string
  /** 以 loading 态弹出一条并返回 id，之后用 update(id, { loading: false, tone: 'success', title: … }) 收尾。 */
  loading: (title: string, options?: NotificationMessageOptions) => string
  /**
   * 先弹出一条 loading，Promise 落定后就地改写为 success / danger；说明等其余字段三态共用。
   * Promise 的结果原样交回调用方，拒绝也照旧拒绝。
   */
  promise: <T>(input: Promise<T> | (() => Promise<T>), options: NotificationPromiseOptions<T>) => Promise<T>
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
      preset={item.preset}
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
      onAction={({ id }: { id: string }) => props.onAction(id)}
    >
      {/* 两种预设同一份结构，排版归皮肤按 data-preset 给。
          指示符与说明都恒渲染——皮肤的 :empty 规则负责把空盒收走，
          而 aria-describedby 无条件指着说明那一个，节点缺席就成了悬空引用 */}
      <XhNotificationItemIndicator />
      <XhNotificationItemContent>
        <XhNotificationItemTitle />
        <XhNotificationItemDescription />
      </XhNotificationItemContent>
      {item.actionLabel ? <XhNotificationItemActionTrigger>{item.actionLabel}</XhNotificationItemActionTrigger> : null}
      {item.closable ? <XhNotificationItemCloseTrigger /> : null}
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
    for (const fn of subs) fn()
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
  // 条目到达与叠摞都挂在作用域包装上；机器的追踪在宿主首次提交之后才去取它
  let rootEl: HTMLElement | null = null
  queue.service.refs.set('getRootEl', () => rootEl)
  const bindRoot = (el: HTMLDivElement | null): void => {
    rootEl = el
  }
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
        <div {...api.getRootProps() as Record<string, unknown>} ref={bindRoot}>
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
    loading: (title, opts = {}) => create({ ...opts, loading: true, title }),
    // 类型参数写成 <T,>：.tsx 里裸的 <T> 会被当成 JSX 标签
    promise: <T,>(input: Promise<T> | (() => Promise<T>), opts: NotificationPromiseOptions<T>): Promise<T> => {
      const { loading, success, error, ...rest } = opts
      const running = typeof input === 'function' ? input() : input
      const { onAction, ...record } = rest
      return controller.trackPromise(
        running,
        { ...record, loading: true, title: loading },
        value => ({ loading: false, tone: 'success', title: typeof success === 'function' ? success(value) : success }),
        reason => ({ loading: false, tone: 'danger', title: typeof error === 'function' ? error(reason) : error }),
        onAction,
      )
    },
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
