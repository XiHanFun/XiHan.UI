/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局命令式通知服务：自带一个挂到 body 的宿主应用与默认渲染模板。
//
// 通知常常不是从组件树里发出来的——推送连接的回调、后台任务的收尾、拦截器里的
// 一条系统消息，调用点都在组件之外。要它们各自去找一份队列上下文并不现实，
// 所以队列由本服务持有，业务代码只管发。
//
// 队列要长在页面结构里（比如通知中心那一栏自己排版）时，用组件形态的
// XhNotificationRoot，那是另一条路，两者不共享队列。
import type {
  NotificationDedupe,
  NotificationOptions,
  NotificationPlacement,
  NotificationTranslations,
  ResolvedNotification,
} from '@xihan-ui/headless'
import type { App, MaybeRefOrGetter, VNode } from 'vue'
import type { XhConfig } from '../config/config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { connectNotification, createFeedbackServiceController, notificationMachine, resolveFeedbackServiceTitle } from '@xihan-ui/headless'
import { computed, createApp, defineComponent, Fragment, h, shallowRef, toValue } from 'vue'
import {
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from '../components/notification/notification'
import { vueNormalize } from '../runtime/normalize-props'
import { useMachine } from '../runtime/use-machine'
import { mountServiceHost } from './mount-host'
import { createServiceConfig } from './service-config'

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
  removeDelay?: number
  pauseOnPageIdle?: boolean
  /** 通知的文案：堆叠区的读屏名与卡片上关闭按钮的读屏名，统一在一个桶中。 */
  translations?: MaybeRefOrGetter<Partial<NotificationTranslations>>
  /**
   * 提供给通知子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主应用，无法接收组件树中的 provideXhConfig，需要与应用同语言时从这里提供；
   * 传 ref/getter 即可在运行期跟随切换语言，也可以之后用 setConfig 推送。
   */
  config?: MaybeRefOrGetter<XhConfig>
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

/** 类型糖的入参：只差 type 与 title，其余同 create。 */
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
  setConfig: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

function defaultCard(
  item: ResolvedNotification,
  translations: Partial<NotificationTranslations> | undefined,
  paused: boolean,
  onUnmounted: (id: string) => void,
  onAction: (id: string) => void,
): VNode {
  return h(XhNotificationItem, {
    id: item.id,
    title: resolveFeedbackServiceTitle(item),
    description: item.description,
    tone: item.tone,
    loading: item.loading,
    duration: item.duration,
    removeDelay: item.removeDelay,
    closable: item.closable,
    pauseOnPageIdle: item.pauseOnPageIdle,
    paused,
    translations,
    onStatusChange: ({ id, status }: { id: string, status: string }) => {
      if (status === 'unmounted')
        onUnmounted(id)
    },
    onAction: () => onAction(item.id),
  }, () => [
    // 四个节点平铺：两列网格与右上角那颗叉都归皮肤，模板套一层行容器只会与它打架。
    // 指示符与说明都恒渲染——皮肤的 :empty 规则负责把空盒收走，
    // 而 aria-describedby 无条件指着说明那一个，节点缺席就成了悬空引用
    h(XhNotificationItemIndicator),
    h(XhNotificationItemTitle),
    h(XhNotificationItemDescription),
    item.actionLabel ? h(XhNotificationItemActionTrigger, () => item.actionLabel) : null,
    item.closable !== false ? h(XhNotificationItemCloseTrigger) : null,
  ])
}

export function createNotificationService(options: NotificationServiceOptions = {}): NotificationService {
  if (typeof document === 'undefined')
    throw new Error('createNotificationService 需要 document；SSR 里请等到客户端再创建')

  const { target, config, ...queueProps } = options
  const configSource = createServiceConfig(config)
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).appendChild(holder)

  let publishState: (paused: boolean) => void = () => {}
  const controller = createFeedbackServiceController<NotificationOptions, Partial<NotificationOptions>>({
    name: 'notification',
    onStateChange: state => publishState(state.paused),
  })
  const pausedAll = shallowRef(controller.state.paused)
  publishState = paused => void (pausedAll.value = paused)

  const Host = defineComponent({
    name: 'XhNotificationServiceHost',
    setup() {
      configSource.provide()
      // props 每帧现展开：文案是 getter 时才跟得上运行期切语言。
      // 队列机器在 setup 里当场 start：它没有 DOM 锚点，而端口紧接着就接上。
      // 等 mounted 再 start 的话，从业务组件的 onMounted 懒建本服务时，宿主的 mounted
      // 会排到调用方那条 post-flush 队列的队尾，调用方接着发的第一条命令就撞上 SEND_BEFORE_MOUNT
      const service = useMachine(
        notificationMachine,
        () => ({ ...queueProps, translations: toValue(queueProps.translations) }),
        undefined,
        { start: 'setup' },
      )
      // 部件不经 provide/inject 取队列：本服务自己收 status-change 把走完退场的那条删掉，
      // 卡片与队列之间因此没有第二条隐式链路
      const api = computed(() => connectNotification(service, vueNormalize))
      controller.attach({
        create: opts => api.value.create(opts),
        update: (id, opts) => api.value.update(id, opts),
        dismiss: id => api.value.dismiss(id),
        dismissAll: () => api.value.dismissAll(),
      })
      return () => {
        const value = api.value
        controller.syncItems(value.visibleNotifications.map(item => item.id))
        return h('div', value.getRootProps() as Record<string, unknown>, value.placements.map(placement =>
          h(
            'div',
            { key: placement, ...value.getGroupProps({ placement }) as Record<string, unknown> },
            // 按队列身份 id 给 key，避免节点被就地复用
            value.getItemsByPlacement(placement).map(item => h(Fragment, { key: item.id }, [
              defaultCard(
                item,
                toValue(queueProps.translations),
                pausedAll.value,
                controller.unmounted,
                controller.invokeAction,
              ),
            ])),
          )))
      }
    },
  })

  const app: App = createApp(Host)
  const mounted = mountServiceHost(app, holder, 'notification')
  if (!mounted)
    controller.attach(null)

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
      if (mounted)
        app.unmount()
      controller.dispose()
      if (!target)
        holder.remove()
    },
  }
}
