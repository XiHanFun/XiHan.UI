// data-* / aria-* 值归一化。
// 约定：假值一律省略属性（返回 undefined），避免 data-disabled="false" 这类反直觉输出。

/** 真时返回 ''（属性存在即真），假时返回 undefined（不输出属性）。 */
export function dataAttr(cond: boolean | undefined): '' | undefined {
  return cond ? '' : undefined
}

/** 真时返回 'true'，假时返回 undefined。用于 aria-* 布尔属性。 */
export function ariaAttr(cond: boolean | undefined): 'true' | undefined {
  return cond ? 'true' : undefined
}

/** 三态：checked | unchecked | indeterminate 之类的 data-state 值。 */
export function dataState<T extends string>(value: T): T {
  return value
}
