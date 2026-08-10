// data-* 值归一化。假值一律省略属性，避免 data-disabled="false" 这类输出。
//
// 不要照这个样子给 aria-* 的布尔状态（aria-checked / expanded / pressed / selected / modal 等）
// 加助手：那些属性省略是「没说」、显式 false 是「明确说了不是」，读屏对两者处理不同，
// 「假值就省略」用在它们身上是静默的错。调用方各自写三元。

/** 真时返回 ''，假时返回 undefined（不输出属性）。 */
export function dataAttr(cond: boolean | undefined): '' | undefined {
  return cond ? '' : undefined
}

/** 三态 data-state 值（checked | unchecked | indeterminate 之类）的取值口。 */
export function dataState<T extends string>(value: T): T {
  return value
}
