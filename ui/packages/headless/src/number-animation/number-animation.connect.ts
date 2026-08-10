import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { NumberAnimationApi, NumberAnimationSchema } from './number-animation.types'
import { numberAnimationAnatomy } from './number-animation.anatomy'
import { formatNumberAnimation, resolveNumberAnimationPrecision } from './number-animation.format'

const parts = numberAnimationAnatomy.build()

/**
 * 数字在变，读屏得跟得上，所以根是 role="status"。
 *
 * 但 aria-live 缺省写死 off，而不是"不写"：status 的隐含 aria-live 就是 polite，
 * 不写等于默认开着，而一个每帧都在变的数字用 polite 会把读屏刷爆——一次动画就是几十条播报。
 * 要播报的场景（倒计时提醒、结算数字）由作者把 live 开到 polite 或 assertive。
 */
export function connectNumberAnimation<T extends PropTypes>(
  service: Service<NumberAnimationSchema>,
  normalize: NormalizeProps<T>,
): NumberAnimationApi<T> {
  const { state, prop, context } = service

  const phase = state.get()
  const value = context.get('value')
  const text = formatNumberAnimation(
    value,
    resolveNumberAnimationPrecision(prop('precision')),
    prop('separator'),
  )

  return {
    phase,
    value,
    text,
    running: phase === 'running',

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'status',
      'aria-live': prop('live') ?? 'off',
      'data-state': phase,
      // 两个视觉轴只落在根上：这个组件只有根这一个部件
      'data-size': prop('size'),
      'data-tone': prop('tone'),
    }),
  }
}
