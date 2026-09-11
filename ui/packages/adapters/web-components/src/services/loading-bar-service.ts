// 全局命令式顶部进度条：自带一个挂到浮层落点的 `<xh-loading-bar>`，
// start/finish 在任意模块作用域可调（路由守卫、请求拦截器），不要求调用点在文档树的某一处。
// 页面结构里的组合用法仍直接写 `<xh-loading-bar>`。
import type { LoadingBarServiceControllerState } from '@xihan-ui/headless'
import type { XhLoadingBarElement } from '../elements/loading-bar'
import type { LoadingBarService, LoadingBarServiceOptions } from './types'
import { createLoadingBarServiceController } from '@xihan-ui/headless'
import { createServiceHolder, partNode, reportServiceFailure } from './host'
import { defineFeedbackElements } from './register'

export function createLoadingBarService(options: LoadingBarServiceOptions = {}): LoadingBarService {
  if (typeof document === 'undefined')
    throw new Error('createLoadingBarService 需要 document；SSR 里请等到客户端再创建')

  defineFeedbackElements()

  const { target, tone = 'brand', errorTone = 'danger', translations, ...barProps } = options
  const { holder, release } = createServiceHolder(target)

  const bar = document.createElement('xh-loading-bar') as XhLoadingBarElement
  const root = partNode('div', 'root')
  const track = partNode('div', 'track')
  const range = partNode('div', 'range')
  track.appendChild(range)
  root.appendChild(track)
  bar.appendChild(root)

  bar.height = barProps.height
  bar.color = barProps.color
  bar.trickle = barProps.trickle
  bar.trickleSpeed = barProps.trickleSpeed
  bar.minimum = barProps.minimum
  bar.fadeDuration = barProps.fadeDuration
  bar.translations = translations

  let mounted = true
  try {
    holder.appendChild(bar)
  }
  catch (error) {
    mounted = reportServiceFailure('loading-bar', error)
    release()
  }

  const apply = (state: LoadingBarServiceControllerState): void => {
    bar.tone = state.tone
    bar.value = state.value
    bar.loading = state.pending > 0
  }
  const controller = createLoadingBarServiceController({ tone, errorTone, onStateChange: apply })
  if (!mounted)
    controller.dispose()

  return {
    start: controller.start,
    finish: controller.finish,
    error: controller.error,
    finishAll: controller.finishAll,
    set: controller.set,
    dispose: () => {
      controller.dispose()
      bar.remove()
      release()
    },
  }
}
