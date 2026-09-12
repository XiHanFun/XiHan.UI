import type { Tone } from '@xihan-ui/core'
// 全局命令式顶部进度条：自带一个挂到 body 的宿主应用，
// start/finish 在任意模块作用域可调（路由守卫、请求拦截器），不要求调用点在组件树内。
// 组件树内的组合用法仍走 XhLoadingBarRoot。
import type { LoadingBarServiceControllerState, LoadingBarTranslations } from '@xihan-ui/headless'
import type { App, MaybeRefOrGetter } from 'vue'
import type { XhConfig } from '../config/config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { connectLoadingBar, createLoadingBarServiceController, loadingBarMachine } from '@xihan-ui/headless'
import { computed, createApp, defineComponent, h, shallowRef, toValue } from 'vue'
import { vueNormalize } from '../runtime/normalize-props'
import { useMachine } from '../runtime/use-machine'
import { mountServiceHost } from './mount-host'
import { createServiceConfig } from './service-config'

export interface LoadingBarServiceOptions {
  /** 正常收尾的语气，缺省 brand。 */
  tone?: Tone
  /** error() 收尾用的语气，缺省 danger：出错的收尾要与正常收尾区分得开。 */
  errorTone?: Tone
  height?: string | number
  color?: string
  trickle?: boolean
  trickleSpeed?: number
  minimum?: number
  fadeDuration?: number
  translations?: MaybeRefOrGetter<Partial<LoadingBarTranslations>>
  /**
   * 喂给进度条子树的全局配置。
   * 本服务自带宿主应用，接不到组件树里的 provideXhConfig，要让它跟应用同语言就从这里给；
   * 传 ref/getter 即可运行期跟着切语言，也可以之后用 setConfig 推。
   */
  config?: MaybeRefOrGetter<XhConfig>
  /** 宿主容器；不给就在 body 下新建一个。 */
  target?: HTMLElement
}

export interface LoadingBarService {
  /** 在途计数 +1；从 0 起跳即开始爬升。 */
  start: () => void
  /** 在途计数 -1（夹到 0，多调不会变负）；归零才收。 */
  finish: () => void
  /** 强制归零并以 errorTone 收。 */
  error: () => void
  /** 不管还剩几笔在途一律收掉（路由跳走时用）。 */
  finishAll: () => void
  /** 切成确定进度：给了值就照它显示，内部爬升停止；再 start() 回到不确定。 */
  set: (value: number) => void
  /** 换一份全局配置源。 */
  setConfig: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

export function createLoadingBarService(options: LoadingBarServiceOptions = {}): LoadingBarService {
  if (typeof document === 'undefined')
    throw new Error('createLoadingBarService 需要 document；SSR 里请等到客户端再创建')

  const { target, config, tone = 'brand', errorTone = 'danger', translations, ...barProps } = options
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).appendChild(holder)

  const configSource = createServiceConfig(config)

  let publishState: (next: LoadingBarServiceControllerState) => void = () => {}
  const controller = createLoadingBarServiceController({
    tone,
    errorTone,
    onStateChange: next => publishState(next),
  })
  const controllerState = shallowRef(controller.state)
  publishState = next => void (controllerState.value = next)

  const Host = defineComponent({
    name: 'XhLoadingBarServiceHost',
    setup() {
      configSource.provide()
      // 直接从 api 渲染那三层，不走部件组件：这棵子树固定且全归服务自己拥有，
      // 经上下文传 api 什么也没换来，却把「跨模块 provide/inject 必须对得上」
      // 加成了一条本可以没有的前提
      const service = useMachine(loadingBarMachine, () => ({
        ...barProps,
        loading: controllerState.value.pending > 0,
        tone: controllerState.value.tone,
        value: controllerState.value.value,
        translations: toValue(translations),
      }))
      const api = computed(() => connectLoadingBar(service, vueNormalize))
      return () => h('div', api.value.getRootProps() as Record<string, unknown>, [
        h('div', api.value.getTrackProps() as Record<string, unknown>, [
          h('div', api.value.getRangeProps() as Record<string, unknown>),
        ]),
      ])
    },
  })

  const app: App = createApp(Host)
  const mounted = mountServiceHost(app, holder, 'loading-bar')
  if (!mounted)
    controller.dispose()

  return {
    start: controller.start,
    finish: controller.finish,
    error: controller.error,
    finishAll: controller.finishAll,
    set: controller.set,
    setConfig: next => configSource.set(next),
    dispose: () => {
      controller.dispose()
      if (mounted)
        app.unmount()
      if (!target)
        holder.remove()
    },
  }
}
