// 全局命令式顶部进度条：自带一个挂到浮层落点的 `<xh-loading-bar>`，
// start/finish 在任意模块作用域可调（路由守卫、请求拦截器），不要求调用点在文档树的某一处。
// 页面结构里的组合用法仍直接写 `<xh-loading-bar>`。
import type { Tone } from '@xihan-ui/core'
import type { XhLoadingBarElement } from '../elements/loading-bar'
import type { LoadingBarService, LoadingBarServiceOptions } from './types'
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

  // 在途计数而不是布尔开关：并发请求里第一个回来时其余还在跑，
  // 布尔开关会把条子提前收掉
  let pending = 0

  const apply = (nextTone: Tone, value: number | undefined): void => {
    bar.tone = nextTone
    bar.value = value
    bar.loading = pending > 0
  }

  const settle = (nextTone: Tone): void => {
    if (!mounted)
      return
    pending = 0
    apply(nextTone, undefined)
  }

  return {
    // 宿主没建起来时整体惰化：状态一动不动
    start: () => {
      if (!mounted)
        return
      pending += 1
      apply(tone, undefined)
    },
    finish: () => {
      if (!mounted)
        return
      pending = Math.max(0, pending - 1)
      apply(bar.tone ?? tone, pending === 0 ? undefined : bar.value)
    },
    error: () => settle(errorTone),
    finishAll: () => settle(tone),
    set: (value) => {
      if (!mounted)
        return
      apply(bar.tone ?? tone, value)
    },
    dispose: () => {
      bar.remove()
      release()
    },
  }
}
