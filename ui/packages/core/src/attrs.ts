// data-* 值归一化。
// 约定：假值一律省略属性（返回 undefined），避免 data-disabled="false" 这类反直觉输出。
//
// aria-* 的布尔状态（aria-checked / expanded / pressed / selected / modal 之类）刻意不给助手：
// 它们要显式写 'true' / 'false'——省略是"没说"，显式 false 是"明确说了不是"，
// 读屏对这两者的处理并不一样。一个"假值就省略"的助手用在这些属性上是静默的错，
// 所以让调用方自己写三元，写的时候就得想清楚这个属性该不该省。

/** 真时返回 ''（属性存在即真），假时返回 undefined（不输出属性）。 */
export function dataAttr(cond: boolean | undefined): '' | undefined {
  return cond ? '' : undefined
}

/** 三态：checked | unchecked | indeterminate 之类的 data-state 值。 */
export function dataState<T extends string>(value: T): T {
  return value
}
