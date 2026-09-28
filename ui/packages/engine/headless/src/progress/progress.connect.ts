/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 progress 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ProgressMeterIssue } from './progress.meter'
import type { ProgressApi, ProgressBand, ProgressProps, ProgressTick } from './progress.types'
import { dataAttr, DIAGNOSTIC_CODES, reportDiagnostic, resolveLocale } from '@xihan-ui/core'
import { progressAnatomy } from './progress.anatomy'
import { PROGRESS_VIEW, progressRing, resolveMax, resolveValue } from './progress.geometry'
import {
  activeBand,
  defaultSegmentValueText,
  progressBands,
  progressTarget,
  progressTicks,
  ringAngle,
  ringBandDash,
  ringLabelPoint,
  ringNeedlePath,
  ringTargetLine,
  ringTickLine,
} from './progress.meter'

const parts = progressAnatomy.build()

/** 分段、目标、刻度与指示方式都只属于量：进度没有「警戒区」也没有「目标」。 */
const METER_ONLY = ['thresholds', 'target', 'scale', 'indicator'] as const

/** 分段、条纹与缓冲都画在横轨上：环形没有可以切格、铺纹理或并排两段填充的横轨。 */
const LINE_ONLY = ['steps', 'striped', 'buffer'] as const

/** 按整格取整时吸收浮点尾差：3/8 × 8 算出来是 2.9999…，不补这一点会少亮一格。 */
const STEP_EPSILON = 1e-9

/** 分段数：不小于 2 的整数才成立，其余报错并按没分段处理。 */
function resolveSteps(steps: number | undefined, issues: ProgressMeterIssue[]): number {
  if (steps == null)
    return 0
  if (Number.isInteger(steps) && steps >= 2)
    return steps
  issues.push({
    code: DIAGNOSTIC_CODES.progressOptionIgnored,
    level: 'error',
    message: `steps 取不小于 2 的整数，收到 ${String(steps)}，这次按没分段处理`,
    detail: { steps },
  })
  return 0
}

// Progress 无状态机：进度全部来自 props，值域夹取、百分比与环的几何就地算。
export function connectProgress<T extends PropTypes>(
  props: ProgressProps,
  normalize: NormalizeProps<T>,
): ProgressApi<T> {
  const max = resolveMax(props.max)
  const value = resolveValue(props.value, max)
  const ratio = value / max
  const percent = Math.round(ratio * 100)
  const semantics = props.semantics ?? 'progress'
  const meter = semantics === 'meter'
  // 量没有"未知"这一档：role=meter 的值恒在，进度未知说的是另一件事
  const indeterminate = meter ? false : !!props.indeterminate
  // 进度未知时谈不上完成
  const complete = !indeterminate && value >= max

  const stateAttr = indeterminate ? 'indeterminate' : complete ? 'complete' : 'loading'

  const variant = props.variant ?? 'line'
  const isRing = variant !== 'line'
  const strokeWidth = props.strokeWidth ?? 6
  const gapDegree = variant === 'dashboard' ? (props.gapDegree ?? 75) : 0
  // 缺口只属于仪表盘：circle 传 0 即整环，起笔角固定在 12 点；
  // 仪表盘的缺口朝向由作者定，起笔角随之转过去。两种形态共用同一份几何
  const ring = isRing
    ? (variant === 'dashboard'
        ? progressRing(ratio, strokeWidth, gapDegree, props.gapPosition ?? 'bottom')
        : progressRing(ratio, strokeWidth, 0, 'top'))
    : null
  // progressRing 会把缺口夹进合法区间：角度换算要用夹过的那个值
  const gap = ring ? 360 - (ring.span / ring.circumference) * 360 : 0

  // —— 量的刻画：分段、目标、刻度与指针 ——
  const issues: ProgressMeterIssue[] = []
  const misplaced = METER_ONLY.filter(key => props[key] != null)
  if (!meter && misplaced.length > 0) {
    issues.push({
      code: DIAGNOSTIC_CODES.chartMeterOnly,
      level: 'error',
      message: `${misplaced.join('、')} 只在 semantics="meter" 下生效：进度没有分段、目标与量程，这次按没给处理`,
      detail: { props: misplaced },
    })
  }
  const bands = meter ? progressBands(props.thresholds, max, issues) : []
  const active = activeBand(bands, ratio)
  const target = meter ? progressTarget(props.target, max, issues) : null
  const ticks = meter ? progressTicks(props.scale, max, resolveLocale(props.locale)) : []
  if (meter && props.indicator === 'needle' && variant !== 'dashboard') {
    issues.push({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      message: `指针只画在仪表盘上，${variant} 形态按 fill 处理`,
      detail: { variant, indicator: props.indicator },
    })
  }
  const indicator = meter && variant === 'dashboard' && props.indicator === 'needle' ? 'needle' : 'fill'

  // —— 线形的三样外观：分段、条纹与缓冲 ——
  const lineOnly = LINE_ONLY.filter(key => props[key] != null && props[key] !== false)
  if (isRing && lineOnly.length > 0) {
    issues.push({
      code: DIAGNOSTIC_CODES.progressOptionIgnored,
      level: 'error',
      message: `${lineOnly.join('、')} 只对线形生效：${variant} 形态没有可分段、可铺纹理的横轨，这次按没给处理`,
      detail: { variant, props: lineOnly },
    })
  }
  const steps = isRing ? 0 : resolveSteps(props.steps, issues)
  if (!isRing && meter && props.buffer != null) {
    issues.push({
      code: DIAGNOSTIC_CODES.progressOptionIgnored,
      level: 'error',
      message: 'buffer 只在进度语义下生效：量没有「已就绪、还没用到」的那一截，这次按没给处理',
      detail: { props: ['buffer'] },
    })
  }
  // 缓冲只属于进度：进度未知时整条已在往复扫，缓冲段无从落位，一并不画
  const buffer = !isRing && !meter && !indeterminate && props.buffer != null
    ? resolveValue(props.buffer, max) / max
    : null
  const striped = !isRing && !!props.striped
  // 分段时填充按整格走：不足一格的部分不画，免得一格只亮一半、读成两个格
  const shown = steps > 0 ? Math.floor(ratio * steps + STEP_EPSILON) / steps : ratio

  for (const issue of issues)
    reportDiagnostic({ code: issue.code, level: issue.level, scope: progressAnatomy.name, message: issue.message, detail: issue.detail })

  // 落在带名字的分段里时，读屏在数值后面补上分段名：「72%，警戒」；作者给了 valueText 就只念作者那句
  const segmentText = props.translations?.segmentValueText ?? defaultSegmentValueText
  const valueText = props.valueText ?? (active?.label ? segmentText({ value: `${percent}%`, label: active.label }) : undefined)

  /** 三个子部件共用的形态与状态标记，皮肤据此分线形与环形两套画法。 */
  const shared = {
    'data-variant': variant,
    'data-state': stateAttr,
  }

  /** 环形部件共用的圆心、半径与转角：与轨道同一圈、同一个起笔处。 */
  const ringCircle = ring
    ? {
        cx: PROGRESS_VIEW / 2,
        cy: PROGRESS_VIEW / 2,
        r: ring.radius,
        transform: `rotate(${ring.rotation} ${PROGRESS_VIEW / 2} ${PROGRESS_VIEW / 2})`,
      }
    : {}

  return {
    variant,
    semantics,
    ratio,
    percent,
    steps,
    buffer,
    bands,
    ticks,
    target,
    indicator,

    // 视觉两轴只落在 root：语气与尺寸都靠自定义属性向下继承，track / range 不必各写一份
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': meter ? 'meter' : 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': String(max),
      // 不确定态一律不发：ARIA 以该属性缺席表达「进度未知」
      'aria-valuenow': indeterminate ? undefined : String(value),
      // 进度不是百分比时（第几步、多少件）由作者给一句人话，读屏念它而不是念数字
      'aria-valuetext': valueText,
      'data-variant': variant,
      'data-state': stateAttr,
      'data-tone': props.tone,
      'data-size': props.size,
      // 有分段时线形改画成子弹图：轨道加厚、填充收窄压在色带上
      'data-banded': dataAttr(bands.length > 0),
      // 指针占着环心：环心内容让到缺口那一侧
      'data-indicator': indicator === 'needle' ? 'needle' : undefined,
    }),

    // 环画在固定的 100×100 里，直径由皮肤的尺寸决定，几何不必跟着重算
    getCanvasProps: () => normalize.element({
      ...parts.canvas.attrs,
      'viewBox': `0 0 ${PROGRESS_VIEW} ${PROGRESS_VIEW}`,
      // 值与语义都在 root 上，这一层纯粹是画面
      'aria-hidden': true,
      'focusable': 'false',
      'data-variant': variant,
    }),

    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      ...shared,
      // 分段：轨道按格数切出等宽的格，填充与缓冲一起被切开
      'data-stepped': dataAttr(steps > 0),
      // 线形的轨道是个空壳（尺寸与底色全归皮肤）；环形要自报圆心、半径与那一整段弧
      ...(ring
        ? {
            ...ringCircle,
            style: {
              fill: 'none',
              strokeWidth: String(strokeWidth),
              // 第一段是弧、第二段是缺口：整周减去弧长即缺口，circle 下缺口为 0
              strokeDasharray: `${ring.span} ${ring.circumference}`,
            },
          }
        : steps > 0 ? { style: { '--xh-_progress-steps': String(steps) } } : {}),
    }),

    getRangeProps: () => normalize.element({
      ...parts.range.attrs,
      ...shared,
      // 零进度另作标记：圆角端点在长度为 0 时会画出一个圆点，皮肤据此收掉；分段时按亮起的格数判
      'data-empty': dataAttr(shown === 0),
      // 条纹铺在填充上：进行中沿行向流动，完成与减弱动效下静止
      'data-striped': dataAttr(striped),
      // 当前值所在的分段决定填充色：语气层按这一位在填充自己身上给出整族取值
      'data-tone': active?.tone,
      // 指针档由指针指出当前值，弧上只留色带：皮肤按这一位收起填充（SVG 图元不吃 UA 的 [hidden] 规则）
      'data-indicator': indicator === 'needle' ? 'needle' : undefined,
      ...(ring
        ? {
            ...ringCircle,
            style: {
              fill: 'none',
              strokeWidth: String(strokeWidth),
              strokeDasharray: `${ring.span} ${ring.circumference}`,
              // 往回缩掉未完成的那一截，满值为 0
              strokeDashoffset: String(ring.offset),
            },
          }
        // 线形交出 0–1 的比例，皮肤据此裁出走完的那段；不取整：3/8 是 0.375，取整会让相邻两档看起来一样长。
        // 分段时交的是亮起的整格占全长的比例
        : { style: { '--xh-_progress-value': String(shown) } }),
    }),

    // 缓冲段与填充同一种画法：铺满轨道、按缓冲比例往行首平移，压在填充之下
    getBufferProps: () => normalize.element({
      ...parts.buffer.attrs,
      'data-variant': variant,
      // 缓冲段取填充那一族的淡色：没写语气时填充是品牌色，缓冲跟着取品牌那一族
      'data-tone': props.tone ?? 'brand',
      'hidden': buffer == null || undefined,
      ...(buffer == null ? {} : { style: { '--xh-_progress-buffer': String(buffer) } }),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'data-variant': variant,
      'data-state': complete ? 'complete' : 'loading',
      // 指针从环心伸出：环心内容让到缺口那一侧
      'data-indicator': indicator === 'needle' ? 'needle' : undefined,
    }),

    // 色带用本段语气的淡色，填充走到这里时换成本段的实色
    getThresholdProps: (band: ProgressBand) => normalize.element({
      ...parts.threshold.attrs,
      'data-variant': variant,
      'data-tone': band.tone,
      ...(ring
        ? (() => {
            const dash = ringBandDash(ring, band)
            return {
              ...ringCircle,
              style: { fill: 'none', strokeWidth: String(strokeWidth), strokeDasharray: dash.dasharray, strokeDashoffset: dash.dashoffset },
            }
          })()
        : { style: { '--xh-_progress-from': String(band.from), '--xh-_progress-to': String(band.to) } }),
    }),

    getTargetProps: () => normalize.element({
      ...parts.target.attrs,
      'data-variant': variant,
      'hidden': target == null || undefined,
      ...(target == null
        ? {}
        : ring
          ? ringTargetLine(ring, strokeWidth, gap, target)
          : { style: { '--xh-_progress-at': String(target) } }),
    }),

    getScaleProps: () => normalize.element({
      ...parts.scale.attrs,
      'data-variant': variant,
      'aria-hidden': true,
      'hidden': ticks.length === 0 || undefined,
    }),

    getScaleTickProps: (tick: ProgressTick) => normalize.element({
      ...parts['scale-tick'].attrs,
      'data-variant': variant,
      ...(ring ? ringTickLine(ring, strokeWidth, gap, tick.at) : { style: { '--xh-_progress-at': String(tick.at) } }),
    }),

    // 刻度值不随 RTL 镜像环形；线形的两端刻度值贴着轨道两端对齐，不探出轨道
    getScaleLabelProps: (tick: ProgressTick) => {
      if (ring) {
        const point = ringLabelPoint(ring, strokeWidth, gap, tick.at)
        return normalize.element({
          ...parts['scale-label'].attrs,
          'data-variant': variant,
          'style': { '--xh-_progress-x': `${point.x}%`, '--xh-_progress-y': `${point.y}%` },
        })
      }
      const align = tick.at <= 0 ? 0 : tick.at >= 1 ? 1 : 0.5
      return normalize.element({
        ...parts['scale-label'].attrs,
        'data-variant': variant,
        'style': { '--xh-_progress-at': String(tick.at), '--xh-_progress-label-align': String(align) },
      })
    },

    getNeedleProps: () => normalize.element({
      ...parts.needle.attrs,
      hidden: indicator !== 'needle' || undefined,
      ...(ring && indicator === 'needle'
        ? { d: ringNeedlePath(ring, strokeWidth), style: { '--xh-_progress-needle-angle': `${Math.round(ringAngle(ring, gap, ratio) * 1000) / 1000}deg` } }
        : {}),
    }),
  }
}
