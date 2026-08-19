import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { ProgressApi, ProgressProps } from './progress.types'
import { dataAttr } from '@xihan-ui/kernel'
import { progressAnatomy } from './progress.anatomy'
import { PROGRESS_VIEW, progressRing, resolveMax, resolveValue } from './progress.geometry'

const parts = progressAnatomy.build()

// Progress 无状态机：进度全部来自 props，值域夹取、百分比与环的几何就地算。
export function connectProgress<T extends PropTypes>(
  props: ProgressProps,
  normalize: NormalizeProps<T>,
): ProgressApi<T> {
  const max = resolveMax(props.max)
  const value = resolveValue(props.value, max)
  const ratio = value / max
  const percent = Math.round(ratio * 100)
  const indeterminate = !!props.indeterminate
  // 进度未知时谈不上完成
  const complete = !indeterminate && value >= max

  const stateAttr = indeterminate ? 'indeterminate' : complete ? 'complete' : 'loading'

  const variant = props.variant ?? 'line'
  const isRing = variant !== 'line'
  // 缺口只属于仪表盘：circle 传 0 即整环，起笔角固定在 12 点；
  // 仪表盘的缺口朝向由作者定，起笔角随之转过去。两种形态共用同一份几何
  const ring = isRing
    ? (variant === 'dashboard'
        ? progressRing(ratio, props.strokeWidth ?? 6, props.gapDegree ?? 75, props.gapPosition ?? 'bottom')
        : progressRing(ratio, props.strokeWidth ?? 6, 0, 'top'))
    : null

  /** 三个子部件共用的形态与状态标记，皮肤据此分线形与环形两套画法。 */
  const shared = {
    'data-variant': variant,
    'data-state': stateAttr,
  }

  return {
    variant,
    ratio,
    percent,

    // 视觉两轴只落在 root：语气与尺寸都靠自定义属性向下继承，track / range 不必各写一份
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': String(max),
      // 不确定态一律不发：ARIA 以该属性缺席表达「进度未知」
      'aria-valuenow': indeterminate ? undefined : String(value),
      // 进度不是百分比时（第几步、多少件）由作者给一句人话，读屏念它而不是念数字
      'aria-valuetext': props.valueText,
      'data-variant': variant,
      'data-state': stateAttr,
      'data-tone': props.tone,
      'data-size': props.size,
    }),

    // 环画在固定的 100×100 里，直径由皮肤的尺寸决定，几何不必跟着重算
    getCanvasProps: () => normalize.element({
      ...parts.canvas.attrs,
      'viewBox': `0 0 ${PROGRESS_VIEW} ${PROGRESS_VIEW}`,
      // 值与语义都在 root 上，这一层纯粹是画面
      'aria-hidden': 'true',
      'focusable': 'false',
      'data-variant': variant,
    }),

    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      ...shared,
      // 线形的轨道是个空壳（尺寸与底色全归皮肤）；环形要自报圆心、半径与那一整段弧
      ...(ring
        ? {
            cx: PROGRESS_VIEW / 2,
            cy: PROGRESS_VIEW / 2,
            r: ring.radius,
            transform: `rotate(${ring.rotation} ${PROGRESS_VIEW / 2} ${PROGRESS_VIEW / 2})`,
            style: {
              fill: 'none',
              strokeWidth: String(props.strokeWidth ?? 6),
              // 第一段是弧、第二段是缺口：整周减去弧长即缺口，circle 下缺口为 0
              strokeDasharray: `${ring.span} ${ring.circumference}`,
            },
          }
        : {}),
    }),

    getRangeProps: () => normalize.element({
      ...parts.range.attrs,
      ...shared,
      // 零进度另作标记：圆角端点在长度为 0 时会画出一个圆点，皮肤据此收掉
      'data-empty': dataAttr(ratio === 0),
      ...(ring
        ? {
            cx: PROGRESS_VIEW / 2,
            cy: PROGRESS_VIEW / 2,
            r: ring.radius,
            transform: `rotate(${ring.rotation} ${PROGRESS_VIEW / 2} ${PROGRESS_VIEW / 2})`,
            style: {
              fill: 'none',
              strokeWidth: String(props.strokeWidth ?? 6),
              strokeDasharray: `${ring.span} ${ring.circumference}`,
              // 往回缩掉未完成的那一截，满值为 0
              strokeDashoffset: String(ring.offset),
            },
          }
        // 线形不取整：3/8 是 37.5%，取整会让相邻两档看起来一样长
        : { style: { inlineSize: `${ratio * 100}%` } }),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'data-variant': variant,
      'data-state': complete ? 'complete' : 'loading',
    }),
  }
}
