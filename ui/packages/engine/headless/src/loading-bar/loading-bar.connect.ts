import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { LoadingBarApi, LoadingBarSchema } from './loading-bar.types'
import { DATA_INERT_EXEMPT, dataAttr } from '@xihan-ui/kernel'
import { loadingBarAnatomy } from './loading-bar.anatomy'
import { LOADING_BAR_HEIGHT } from './loading-bar.machine'
import { clampLoadingBarValue, isLoadingBarDeterminate, LOADING_BAR_MAX } from './loading-bar.trickle'

const parts = loadingBarAnatomy.build()

/** 厚度归一：数字按像素，字符串原样，缺省用默认值。 */
function toBlockSize(height: string | number | undefined): string {
  if (typeof height === 'number')
    return `${height}px`
  return height ?? LOADING_BAR_HEIGHT
}

export function connectLoadingBar<T extends PropTypes>(
  service: Service<LoadingBarSchema>,
  normalize: NormalizeProps<T>,
): LoadingBarApi<T> {
  const { state, prop, context } = service

  const phase = state.get()
  const visible = phase !== 'idle'
  const determinate = isLoadingBarDeterminate(prop('value'))
  const value = clampLoadingBarValue(context.get('value'))
  const color = prop('color')

  return {
    phase,
    value,
    visible,
    indeterminate: !determinate,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'progressbar',
      // progressbar 没有可见标题，可及名字只能由这里给
      'aria-label': prop('translations')?.root ?? 'Loading',
      'aria-valuemin': '0',
      'aria-valuemax': String(LOADING_BAR_MAX),
      // 不确定进度按规范省略 aria-valuenow
      'aria-valuenow': determinate ? String(value) : undefined,
      'data-state': phase,
      'data-tone': prop('tone'),
      'data-indeterminate': dataAttr(!determinate),
      // 模态浮层给背景施加 inert 时跳过这棵子树：进度条是全局的，
      // 对话框开着时它照旧要可见、role=progressbar 也要留在无障碍树里
      [DATA_INERT_EXEMPT]: '',
      // 收起时留着节点，只加 hidden
      'hidden': !visible || undefined,
      // 厚度由连接层写内联样式
      'style': { blockSize: toBlockSize(prop('height')) },
    }),

    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      'data-state': phase,
    }),

    getRangeProps: () => normalize.element({
      ...parts.range.attrs,
      'data-state': phase,
      // 两个样式键每帧都写全，用不上的写空串清掉
      'style': { inlineSize: `${value}%`, background: color ?? '' },
    }),
  }
}
