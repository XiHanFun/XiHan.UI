import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { CountdownApi, CountdownSchema } from './countdown.types'
import { dataAttr } from '@xihan-ui/kernel'
import { countdownAnatomy } from './countdown.anatomy'
import { formatCountdown, quantizeCountdown, resolveCountdownPrecision, splitCountdown } from './countdown.format'

const parts = countdownAnatomy.build()

/**
 * 数字在变，读屏得跟得上，所以根是 role="status"。
 *
 * 但 aria-live 缺省写死 off，而不是"不写"：status 的隐含 aria-live 就是 polite，
 * 不写等于默认开着，而一个每帧都在变的数字用 polite 会把读屏刷爆——一分钟的倒计时就是六十条播报。
 * 要播报的场景（会话到期提醒这类）由作者把 live 开到 polite 或 assertive。
 */
export function connectCountdown<T extends PropTypes>(
  service: Service<CountdownSchema>,
  normalize: NormalizeProps<T>,
): CountdownApi<T> {
  const { state, prop, context } = service

  const phase = state.get()
  // 量化一次，拆分与铺字都读这一个数，免得两处各自取整取出不一样的秒
  const value = quantizeCountdown(context.get('remaining'), resolveCountdownPrecision(prop('precision')))
  const finished = value <= 0

  return {
    phase,
    value,
    text: formatCountdown(value, prop('format')),
    parts: splitCountdown(value),
    running: phase === 'running',
    finished,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'status',
      'aria-live': prop('live') ?? 'off',
      'data-state': phase,
      // 归零与"停着"是两回事：暂停在 30 秒上也是 idle，皮肤要分得开
      'data-finished': dataAttr(finished),
    }),
  }
}
