import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { LoadingBarApi, LoadingBarSchema } from './loading-bar.types'
import { dataAttr } from '@xihan-ui/core'
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
  // 受控时 cell 直读 prop，非受控时读内部值：两种模式在这里已经收成同一个数
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
      // progressbar 没有可见标题，名字只能由这里给；不给的话读屏只念得出"进度条"
      'aria-label': prop('translations')?.root ?? 'Loading',
      'aria-valuemin': '0',
      'aria-valuemax': String(LOADING_BAR_MAX),
      // 不确定进度按规范省略 aria-valuenow：报一个自己编出来的数等于对读屏撒谎，
      // "这个属性缺席"本身才是"进度未知"的表达
      'aria-valuenow': determinate ? String(value) : undefined,
      'data-state': phase,
      'data-indeterminate': dataAttr(!determinate),
      // 收起时留着节点、只加 hidden：卸载掉的是作者写的结构，替他删了他就再也拿不回来
      'hidden': !visible || undefined,
      // 厚度这条轴归连接层：缺省值在这里收口，皮肤不再声明 block-size
      'style': { blockSize: toBlockSize(prop('height')) },
    }),

    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      'data-state': phase,
    }),

    getRangeProps: () => normalize.element({
      ...parts.range.attrs,
      'data-state': phase,
      // 宽度这条轴归连接层。两个键每帧都写全（用不上的写空串清掉）：
      // WC 侧是 Object.assign 到 style 上，这一帧漏掉的键会留着上一帧的值
      'style': { inlineSize: `${value}%`, background: color ?? '' },
    }),
  }
}
