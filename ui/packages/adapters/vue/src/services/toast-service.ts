// 全局命令式通知服务：自带一个挂到 body 的宿主应用与默认渲染模板，
// create/success 等命令在任意模块作用域可调（请求拦截器、store），
// 不要求调用点在组件树内。组件树内的组合用法仍走 XhToasterRoot。
import type { ToasterSchema, ToasterTranslations, ToastOptions, ToastPlacement, ToastRecord, ToastTranslations, ToastType } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import type { ToasterContext } from '../components/toaster/use-toaster'
import { createApp, defineComponent, Fragment, h } from 'vue'
import { XhToastCloseTrigger, XhToastDescription, XhToastRoot, XhToastTitle } from '../components/toast/toast'
import { provideToaster } from '../components/toaster/context'
import { XhToasterGroup } from '../components/toaster/toaster'
import { useToaster } from '../components/toaster/use-toaster'
import { typeBadge } from './glyph'

export interface ToastServiceOptions {
  /** 默认落位，服务档默认 'top'（轻提示习惯位）；单条可用 options.placement 覆盖。 */
  placement?: ToastPlacement
  /** 每个位置最多同时留几条，默认 5。 */
  max?: number
  gap?: number
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
  translations?: Partial<ToasterTranslations>
  /** toast 部件的文案（关闭钮的读屏名等）。 */
  toastTranslations?: Partial<ToastTranslations>
  /** 宿主容器；不给就在 body 下新建一个。 */
  target?: HTMLElement
}

/** 类型糖的入参：只差 type，其余同 create。 */
export type ToastMessageOptions = Omit<ToastOptions, 'type' | 'title'>

export interface ToastService {
  /** 入队并返回 id；同 id 已存在则就地改写。 */
  create: (options?: ToastOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (message: string, options?: ToastMessageOptions) => string
  success: (message: string, options?: ToastMessageOptions) => string
  warning: (message: string, options?: ToastMessageOptions) => string
  error: (message: string, options?: ToastMessageOptions) => string
  /** 返回 id，之后用 update(id, { type: 'success', title: … }) 收尾。 */
  loading: (message: string, options?: ToastMessageOptions) => string
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

function defaultToast(
  toast: ToastRecord,
  translations: Partial<ToastTranslations> | undefined,
  onUnmounted: (id: string) => void,
): VNode {
  return h(XhToastRoot, {
    id: toast.id,
    title: toast.title,
    description: toast.description,
    type: toast.type,
    duration: toast.duration,
    removeDelay: toast.removeDelay,
    closable: toast.closable,
    translations,
    onStatusChange: ({ id, status }: { id: string, status: string }) => {
      if (status === 'unmounted')
        onUnmounted(id)
    },
  }, () => [
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--xh-space-2)' } }, [
      typeBadge(toast.type),
      h(XhToastTitle),
    ]),
    toast.description ? h(XhToastDescription) : null,
    toast.closable !== false ? h(XhToastCloseTrigger) : null,
  ])
}

export function createToastService(options: ToastServiceOptions = {}): ToastService {
  if (typeof document === 'undefined')
    throw new Error('createToastService 需要 document；SSR 里请等到客户端再创建')

  const { target, toastTranslations, ...toasterProps } = options
  const holder = target ?? document.createElement('div')
  if (!target)
    document.body.appendChild(holder)

  let ctx: ToasterContext | null = null

  const Host = defineComponent({
    name: 'XhToastServiceHost',
    setup() {
      const inner = useToaster({ placement: 'top', max: 5, ...toasterProps } as ToasterSchema['props'])
      provideToaster(inner)
      ctx = inner
      return () => {
        const api = inner.api.value
        return h('div', api.getRootProps() as Record<string, unknown>, api.placements.map(placement =>
          h(XhToasterGroup, { key: placement, placement }, {
            default: ({ toast }: { toast: ToastRecord }) =>
              h(Fragment, { key: toast.id }, [defaultToast(toast, toastTranslations, inner.dismiss)]),
          })))
      }
    },
  })

  const app: App = createApp(Host)
  app.mount(holder)

  const use = (): ToasterContext => {
    if (!ctx)
      throw new Error('toast 服务已卸载')
    return ctx
  }
  const sugar = (type: ToastType) => (message: string, opts: ToastMessageOptions = {}): string =>
    use().create({ ...opts, type, title: message })

  return {
    create: opts => use().create(opts),
    update: (id, opts) => use().update(id, opts),
    dismiss: id => use().dismiss(id),
    dismissAll: () => use().dismissAll(),
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    loading: sugar('loading'),
    dispose: () => {
      app.unmount()
      ctx = null
      if (!target)
        holder.remove()
    },
  }
}
