import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { QrCodeApi, QrCodeProps, QrCodeState } from './qr-code.types'
import type { QrLevel } from './qr-encode'
import { qrCodeAnatomy } from './qr-code.anatomy'
import { qrEncode } from './qr-encode'

const parts = qrCodeAnatomy.build()

const DEFAULT_LEVEL: QrLevel = 'M'
const DEFAULT_MARGIN = 4
const DEFAULT_SIZE = 160

/** 没画出码时透出的空矩阵，恒等以免每次调用都换一个新数组。 */
const EMPTY_MODULES: readonly (readonly boolean[])[] = []

/**
 * 把矩阵合成一条路径的 d：每一行里连续的深色模块并成一个矩形子路径。
 * 一格一个 `<rect>` 的话，40 版满码是三万多个节点。
 */
function buildPath(modules: readonly (readonly boolean[])[], margin: number): string {
  const segments: string[] = []
  for (let row = 0; row < modules.length; row++) {
    const line = modules[row]!
    let col = 0
    while (col < line.length) {
      if (!line[col]) {
        col++
        continue
      }
      let run = 1
      while (col + run < line.length && line[col + run])
        run++
      segments.push(`M${col + margin} ${row + margin}h${run}v1h-${run}z`)
      col += run
    }
  }
  return segments.join('')
}

/**
 * 取一个非负整数档位。
 * 没给、给了 null、或给了非有限数一律落回缺省值：NaN 会一路写进 viewBox 与内联尺寸，
 * 得到的是一个不报错也不显示的 `viewBox="0 0 NaN NaN"`。
 */
function resolveNumber(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : fallback
}

/**
 * QrCode 无状态机：矩阵全部由 props 算出。
 *
 * 矩阵只在这里算一遍，适配器直接取 api 上现成的 `path` 与 `viewBox` 画，两端不各算一次。
 *
 * 编码失败（内容超出 40 版容量）不往外抛：抛在 Vue 的 computed 或 WC 的 wire 里会连累整棵树。
 * 改成落到 `state: 'error'` 并且一个模块都不铺——宁可什么都不画，也不画一张扫出半截内容的码。
 *
 * 命名分两态且互斥，与 Icon 同一套判据：
 * · 有名字 → role="img" + aria-label，不写 aria-hidden；
 * · 无名字（label 与 value 都是空白） → aria-hidden="true"，不写 role 与 aria-label。
 */
export function connectQrCode<T extends PropTypes>(
  props: QrCodeProps,
  normalize: NormalizeProps<T>,
): QrCodeApi<T> {
  const value = props.value ?? ''
  const level = props.level ?? DEFAULT_LEVEL
  const margin = resolveNumber(props.margin, DEFAULT_MARGIN)
  const size = resolveNumber(props.size, DEFAULT_SIZE)

  let modules = EMPTY_MODULES
  let version = 0
  let state: QrCodeState = 'empty'
  let error: string | undefined
  if (value !== '') {
    try {
      const matrix = qrEncode(value, level)
      modules = matrix.modules
      version = matrix.version
      state = 'ready'
    }
    catch (cause) {
      state = 'error'
      error = cause instanceof Error ? cause.message : String(cause)
    }
  }

  const count = version === 0 ? 0 : 4 * version + 17
  const viewBox = `0 0 ${count + margin * 2} ${count + margin * 2}`
  const path = version === 0 ? '' : buildPath(modules, margin)

  // 空串与纯空白不算给过名字：认了它就得到一个有 role="img" 却没有名字的对象，读屏只报"图像"
  const named = props.label ?? value
  const label = named.trim() === '' ? undefined : named

  return {
    modules,
    version,
    count,
    margin,
    viewBox,
    path,
    state,
    error,
    label,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'viewBox': viewBox,
      // 模块边界都落在整数坐标上，交给渲染器按整像素画，边缘不出现半透明的过渡带
      'shape-rendering': 'crispEdges',
      'role': label === undefined ? undefined : 'img',
      'aria-label': label,
      'aria-hidden': label === undefined ? 'true' : undefined,
      'data-level': level,
      // 没画出码时这两个属性不写，皮肤与调试都不会读到一个假的版本号
      'data-version': version === 0 ? undefined : String(version),
      'data-modules': version === 0 ? undefined : String(count),
      'data-state': state,
      'style': { inlineSize: `${size}px`, blockSize: `${size}px` },
    }),
  }
}
