// 错误表的纯运算，不碰 DOM、不看状态机。
// 不变量：在表里 = 这个字段此刻有错。空串与 undefined 不是一条错误，而是"把这条清掉"。

/** 字段名 → 错误文案。只装真正有错的字段。 */
export type FormErrors = Record<string, string>

/**
 * 允许"清空"的错误表写法：校验函数的返回值与命令式的 setFieldError 都收这个形状，
 * 空串 / undefined / null 表示这条没有错误。
 */
export type FormErrorPatch = Record<string, string | undefined | null>

/** 自有属性判定。错误表是普通对象字面量，`'toString' in errors` 会被原型链骗过去。 */
function has(table: object, key: string): boolean {
  return Object.hasOwn(table, key)
}

function isMessage(value: unknown): value is string {
  return typeof value === 'string' && value !== ''
}

/**
 * 清理成规范的错误表：只留下非空字符串。
 * 校验函数的返回值、受控的 errors、defaultErrors 三条入口都要过这一道。
 */
export function normalizeFormErrors(raw: FormErrorPatch | undefined | null): FormErrors {
  const out: FormErrors = {}
  if (!raw)
    return out
  for (const key of Object.keys(raw)) {
    const message = raw[key]
    if (isMessage(message))
      out[key] = message
  }
  return out
}

/**
 * 按字段合并：patch 里给了文案就写上，给空的就删掉，没提到的字段原样不动。
 * 逐字段校验（blur / change）走这条。
 *
 * 没有任何改动时原样返回 current（同一个引用），调用方据此跳过一次通知。
 */
export function mergeFormErrors(current: FormErrors, patch: FormErrorPatch): FormErrors {
  let changed = false
  const out: FormErrors = { ...current }
  for (const key of Object.keys(patch)) {
    const message = patch[key]
    if (isMessage(message)) {
      if (out[key] !== message) {
        out[key] = message
        changed = true
      }
      continue
    }
    if (has(out, key)) {
      delete out[key]
      changed = true
    }
  }
  return changed ? out : current
}

/** 表里的字段名，保持插入顺序。 */
export function formErrorNames(errors: FormErrors): string[] {
  return Object.keys(errors)
}

/**
 * 两张错误表逐键比。
 * 不能用 cell 默认的 Object.is：受控时每读一次都会把 prop 清理成一张新表，引用恒不相等。
 */
export function sameFormErrors(a: FormErrors, b: FormErrors | undefined): boolean {
  if (!b)
    return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length)
    return false
  return keys.every(key => has(b, key) && a[key] === b[key])
}

/**
 * 提交失败后焦点该落在哪个字段上：按文档序取第一个出错的字段。
 *
 * domOrder 里一个都没命中时退回键序的第一条——字段容器可能压根没渲染
 * （分步表单的下一步、条件字段），此时给不出文档序。
 */
export function firstFormErrorName(domOrder: readonly string[], errors: FormErrors): string | null {
  for (const name of domOrder) {
    if (has(errors, name))
      return name
  }
  return Object.keys(errors)[0] ?? null
}
