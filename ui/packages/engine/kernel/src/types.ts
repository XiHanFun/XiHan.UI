// 生命周期与通用类型契约。

/** 任意字符串键字典。 */
export type Dict<T = unknown> = Record<string, T>

/** 可释放资源。 */
export interface Disposable {
  /** 幂等，重复调用无副作用。 */
  dispose: () => void
  /** dev 构建下标记是否已释放。 */
  readonly disposed?: boolean
}

/** 清理函数，与 machine effects 的返回签名一致。 */
export type Cleanup = () => void

/** 把 Disposable 适配成 machine effect 期望的 Cleanup。 */
export function toCleanup(d: Disposable): Cleanup {
  return () => d.dispose()
}

/** 方向。 */
export type Direction = 'ltr' | 'rtl'

/** 朝向。 */
export type Orientation = 'horizontal' | 'vertical'

/** ARIA 布尔值：真时输出 'true'，假时省略（返回 undefined）。 */
export type MaybeBooleanish = boolean | undefined

/**
 * 浮层这一次是怎么关的。
 *
 * 原因在机器里早就算出来了（消解层回报 escape-key 还是 interact-outside、
 * 关闭按钮与 Tab 各自带 src），此前只用来决定要不要归还焦点，没有交到使用者手上。
 * 拿它可以区分「用户主动取消」与「选完自动收起」，前者常常要回滚草稿。
 */
export type OverlayCloseReason =
  /** Escape 键。 */
  | 'esc'
  /** 关闭按钮。 */
  | 'close-trigger'
  /** 点在浮层之外。 */
  | 'interact-outside'
  /** 焦点被 Tab 带离。 */
  | 'tab'
  /** 选中了某一项后自动收起。 */
  | 'selection'
  /** 指针移开（悬停型浮层）。 */
  | 'hover'
  /** 代码调用，非用户操作。 */
  | 'programmatic'

// —— 三条视觉轴 ——
//
// 取值不是设计出来的，是从 108 份皮肤里的选择器数出来的：写了 [data-tone='x'] 的才算数。
// 这三个类型与皮肤是一份契约的两面，改这里就要同时改皮肤，反之亦然。

/**
 * 语气。六档，由 `tone.css` 那一层统一提供，组件不各自实现。
 * 它只影响强调色（聚焦、选中、强调条），不动正文文字色。
 */
export type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

/**
 * 尺寸。三档，`md` 是缺省档，所以多数皮肤只写 sm 与 lg 两条选择器。
 *
 * 注意 `qr-code` 与 `splitter` 的 `size` 不是这条轴：前者是像素边长，后者是各栏比例，
 * 都保持数值类型。那两处是同名不同义，与本类型无关。
 */
export type Size = 'sm' | 'md' | 'lg'

/**
 * 输入类控件的形态三档。
 *
 * 不含 `solid`，这是刻意的：实心底压着一个可编辑的值，读起来像块不可点的色板。
 * 12 个输入控件（select / combobox / text-field / date-field 等）共用这一档。
 */
export type ControlVariant = 'outline' | 'subtle' | 'ghost'

/**
 * 可按下的表面的形态四档：在输入类三档之上多一个 `solid`。
 * button / button-group / toggle / icon-wrapper 共用。
 */
export type ActionVariant = ControlVariant | 'solid'
